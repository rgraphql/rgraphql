package resolve

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"sync"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/introspect"
	"github.com/rgraphql/magellan/qtree"
	"github.com/rgraphql/magellan/types"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

type Resolver interface {
	Execute(rc *resolutionContext, resolver reflect.Value)
}

// ExecutionContext controls execution of an entire qtree.
type ExecutionContext struct {
	rootContext context.Context
	cancelFunc  context.CancelFunc

	emtx              sync.Mutex
	resolverIdCounter uint32
	messageChan       chan *proto.RGQLServerMessage

	wg sync.WaitGroup
}

// Messages returns the internal buffered channel used for messages.
func (ec *ExecutionContext) Messages() <-chan *proto.RGQLServerMessage {
	return ec.messageChan
}

// Wait waits for all resolvers to exit / finish.
func (ec *ExecutionContext) Wait() {
	ec.wg.Wait()
}

// Cancel ends the execution context.
func (ec *ExecutionContext) Cancel() {
	ec.cancelFunc()
}

// Stored data about the current resolution on a resolver level.
// Corresponds to a "Value tree node" on the client.
// Stores a value, represents resolution of a particular query part.
type resolutionContext struct {
	*ExecutionContext

	ctx       context.Context
	ctxCancel context.CancelFunc
	parentCtx context.Context

	rmtx           sync.Mutex
	lastResolverId uint32
	resolverId     uint32
	qnode          *qtree.QueryTreeNode

	// If we are a "virtual child" (a link in a channel chain, for example)
	// We do not want to actually transmit values from this context.
	virtualParent *resolutionContext
	// Have we ever transmitted this resolver?
	transmitted bool

	// Have we transmitted since the value was set?
	valueTransmitted bool
	hasValue         bool
	pendingValue     []byte
	resolveErr       error
	isArrayContainer bool
}

// Spawns a child resolver (for a field)
func (rc *resolutionContext) Child(nod *qtree.QueryTreeNode, isArrayElement bool, isArrayContainer bool) *resolutionContext {
	var nrid uint32
	isVirtual := nod == rc.qnode && !isArrayElement
	if !isVirtual {
		rc.emtx.Lock()
		rc.ExecutionContext.resolverIdCounter++
		nrid = rc.ExecutionContext.resolverIdCounter
		rc.emtx.Unlock()

	} else {
		nrid = rc.resolverId
	}

	rc.Transmit()

	cctx, cctxCancel := context.WithCancel(rc.ctx)
	nrc := &resolutionContext{
		ctx:              cctx,
		ctxCancel:        cctxCancel,
		parentCtx:        rc.ctx,
		ExecutionContext: rc.ExecutionContext,
		lastResolverId:   rc.resolverId,
		resolverId:       nrid,
		qnode:            nod,
		isArrayContainer: isArrayContainer,
	}
	if isVirtual {
		if rc.virtualParent != nil {
			nrc.virtualParent = rc.virtualParent
		} else {
			nrc.virtualParent = rc
		}
	}
	return nrc
}

func (rc *resolutionContext) SetValue(value interface{}) error {
	if rc.virtualParent != nil {
		return rc.virtualParent.SetValue(value)
	}

	// Serialize
	dat, err := json.Marshal(value)
	if err != nil {
		return err
	}

	// Write, so that we will Transmit() later
	rc.rmtx.Lock()
	rc.hasValue = true
	rc.valueTransmitted = false
	rc.pendingValue = dat
	rc.resolveErr = nil
	rc.rmtx.Unlock()

	rc.Transmit()
	return nil
}

func (rc *resolutionContext) SetError(err error) error {
	if rc.virtualParent != nil {
		return rc.virtualParent.SetError(err)
	}

	// Write, so that we will Transmit() later
	rc.rmtx.Lock()
	rc.hasValue = false
	rc.resolveErr = err
	rc.valueTransmitted = false
	rc.pendingValue = nil
	rc.rmtx.Unlock()

	// TODO: same question as above.
	rc.Transmit()
	return nil
}

func (rc *resolutionContext) buildMutation() *proto.RGQLValueMutation {
	if rc.transmitted {
		return &proto.RGQLValueMutation{
			ValueNodeId: rc.resolverId,
			IsArray:     rc.isArrayContainer,
		}
	}

	return &proto.RGQLValueMutation{
		ParentValueNodeId: rc.lastResolverId,
		ValueNodeId:       rc.resolverId,
		QueryNodeId:       rc.qnode.Id,
		IsArray:           rc.isArrayContainer,
	}
}

// Inform the client of any changes to this resolver
func (rc *resolutionContext) Transmit() {
	if rc.virtualParent != nil {
		return
	}

	done := rc.rootContext.Done()

	select {
	case <-done:
		return
	default:
	}

	rc.rmtx.Lock()
	defer rc.rmtx.Unlock()

	if rc.transmitted && rc.valueTransmitted {
		return
	}

	msg := rc.buildMutation()
	if rc.resolveErr == nil {
		msg.Operation = proto.RGQLValueMutation_VALUE_SET
		if rc.hasValue && !rc.valueTransmitted {
			msg.HasValue = true
			msg.ValueJson = string(rc.pendingValue)
		}
	} else if !rc.valueTransmitted {
		msg.Operation = proto.RGQLValueMutation_VALUE_ERROR
		jsonStr, _ := json.Marshal(rc.resolveErr.Error())
		msg.ValueJson = string(jsonStr)
	}

	smsg := &proto.RGQLServerMessage{
		MutateValue: msg,
	}
	select {
	case rc.ExecutionContext.messageChan <- smsg:
	case <-done:
		return
	}
	rc.transmitted = true
	rc.valueTransmitted = true
	rc.pendingValue = nil
}

// Cancel indicates that this node and all children
// are now invalid and need to be removed from the client.
func (rc *resolutionContext) Purge() {
	if rc.virtualParent != nil {
		rc.virtualParent.Purge()
		return
	}

	if rc.ctxCancel != nil {
		rc.ctxCancel()
	}

	if rc.qnode == nil {
		return
	}

	select {
	case <-rc.qnode.Done():
		return
	default:
	}

	rc.wg.Add(1)

	mut := rc.buildMutation()
	mut.Operation = proto.RGQLValueMutation_VALUE_DELETE

	rc.messageChan <- &proto.RGQLServerMessage{
		MutateValue: mut,
	}
	rc.wg.Done()
}

type TypeResolverPair struct {
	GqlType      ast.Node
	ResolverType reflect.Type
}

// ASTLookup can look up pointers to type definitions.
type ASTLookup interface {
	LookupType(ast.Type) ast.TypeDefinition
}

// ResolverMap is a map of graphQL type and Go type pairs to resolver functions.
type ResolverMap map[TypeResolverPair]Resolver

type ResolverTree struct {
	Resolvers             ResolverMap
	Lookup                ASTLookup
	IntrospectionResolver *introspect.SchemaResolver
}

func NewResolverTree(lookup ASTLookup,
	introspectionResolver *introspect.SchemaResolver) *ResolverTree {

	return &ResolverTree{
		Resolvers:             make(ResolverMap),
		Lookup:                lookup,
		IntrospectionResolver: introspectionResolver,
	}
}

// StartQuery begins executing a QueryTree
func StartQuery(r Resolver, ctx context.Context, rootResolver reflect.Value, tree *qtree.QueryTreeNode) *ExecutionContext {
	qctx, qcancel := context.WithCancel(ctx)
	ec := &ExecutionContext{
		rootContext: ctx,
		cancelFunc:  qcancel,
		messageChan: make(chan *proto.RGQLServerMessage, 50),
	}
	rc := &resolutionContext{
		ctx:              qctx,
		ctxCancel:        qcancel,
		parentCtx:        ctx,
		ExecutionContext: ec,
		lastResolverId:   0,
		resolverId:       0,
		qnode:            tree,
		// Mark the root as already transmitted (the client knows about it on default)
		transmitted:      true,
		valueTransmitted: true,
	}
	// Add one to the wg. Conveniently, the root won't call Add() or Done() on the wg.
	rc.wg.Add(1)
	// Call waitCancel with isRoot=true, this will wait for the query context to be canceled.
	// We use a wait group because we might want to cancel the entire tree, AND wait for everything to stop.
	go r.Execute(rc, rootResolver)
	return ec
}

func (rt *ResolverTree) lookupType(gt ast.Type) (ast.TypeDefinition, error) {
	nextType := rt.Lookup.LookupType(gt)
	if nextType == nil {
		if ntn, ok := gt.(*ast.Named); ok {
			return nil, fmt.Errorf("Cannot find type named %s.", ntn.Name.Value)
		}
		return nil, fmt.Errorf("Cannot find type %#v.", gt)
	}
	return nextType, nil
}

// Follow a named pointer.
func (rt *ResolverTree) buildFollowResolver(resolver reflect.Type, typ ast.Type) (Resolver, error) {
	if types.IsAstPrimitive(typ) {
		// isAstPrimitive asserts ast.Named
		return rt.buildPrimitiveResolver(resolver, typ.(*ast.Named))
	}

	nextType, err := rt.lookupType(typ)
	if err != nil {
		return nil, err
	}
	return rt.BuildResolver(TypeResolverPair{
		GqlType:      nextType,
		ResolverType: resolver,
	})
}

func (rt *ResolverTree) BuildResolver(pair TypeResolverPair) (resolver Resolver, err error) {
	if er, ok := rt.Resolvers[pair]; ok {
		return er, nil
	}

	defer func() {
		if err == nil && resolver != nil {
			rt.Resolvers[pair] = resolver
		}
	}()

	switch gt := pair.GqlType.(type) {
	case *ast.NonNull:
		return rt.BuildResolver(TypeResolverPair{
			GqlType:      gt.Type,
			ResolverType: pair.ResolverType,
		})
	case *ast.Named:
		// Follow name pointer
		return rt.buildFollowResolver(pair.ResolverType, gt)
	case *ast.List:
		return rt.buildListResolver(pair, gt)
	case *ast.ObjectDefinition:
		return rt.buildObjectResolver(pair, gt)
	case *ast.EnumDefinition:
		return rt.buildEnumResolver(pair.ResolverType, gt)
	default:
		return nil, fmt.Errorf("Unsupported kind %s", pair.GqlType.GetKind())
	}
}
