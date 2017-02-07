package resolve

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"sync"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/qtree"
	"github.com/rgraphql/magellan/types"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

type Resolver interface {
	Execute(rc *resolutionContext, resolver reflect.Value)
}

// Stored data for the entire execution of a qtree.
type executionContext struct {
	rootContext context.Context
	cancelFunc  context.CancelFunc

	emtx              sync.Mutex
	resolverIdCounter uint32
	messageChan       chan *proto.RGQLServerMessage

	wg sync.WaitGroup
}

func (ec *executionContext) Messages() <-chan *proto.RGQLServerMessage {
	return ec.messageChan
}

func (ec *executionContext) Wait() {
	ec.wg.Wait()
}

func (ec *executionContext) Cancel() {
	ec.cancelFunc()
}

// Stored data about the current resolution on a resolver level.
type resolutionContext struct {
	*executionContext

	ctx       context.Context
	ctxCancel context.CancelFunc

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
}

// Spawns a child resolver (for a field)
func (rc *resolutionContext) Child(nod *qtree.QueryTreeNode) *resolutionContext {
	var nrid uint32
	isVirtual := nod == rc.qnode
	if !isVirtual {
		rc.emtx.Lock()
		rc.executionContext.resolverIdCounter++
		nrid := rc.executionContext.resolverIdCounter
		rc.emtx.Unlock()

		fmt.Printf("Incrementing resolver %s->%s (%d->%d)\n", rc.qnode.FieldName, nod.FieldName, rc.resolverId, nrid)
		rc.Transmit()
	} else {
		nrid = rc.resolverId
	}

	cctx, cctxCancel := context.WithCancel(rc.ctx)
	nrc := &resolutionContext{
		ctx:              cctx,
		ctxCancel:        cctxCancel,
		executionContext: rc.executionContext,
		lastResolverId:   rc.resolverId,
		resolverId:       nrid,
		qnode:            nod,
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
	// TODO: de-duplicate messages (avoid sending the same value twice)
	rc.rmtx.Lock()
	rc.hasValue = true
	rc.valueTransmitted = false
	rc.pendingValue = dat
	rc.resolveErr = nil
	rc.rmtx.Unlock()

	// TODO: trigger transmit() here? or do we batch those?
	// Maybe trigger transmit() from another goroutine managing the query?
	// It's important the client knows about the resolver before we send children.
	// So block here, and call Transmit() to push the message into the queue.
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
	return &proto.RGQLValueMutation{
		ParentValueNodeId: rc.lastResolverId,
		ValueNodeId:       rc.resolverId,
		QueryNodeId:       rc.qnode.Id,
	}
}

// Inform the client of any changes to this resolver
func (rc *resolutionContext) Transmit() {
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
	case rc.executionContext.messageChan <- smsg:
	case <-done:
		return
	}
	if !rc.transmitted {
		go rc.waitCancel(false)
	}
	rc.transmitted = true
	rc.valueTransmitted = true
}

func (rc *resolutionContext) waitCancel(isRoot bool) {
	if !isRoot {
		rc.wg.Add(1)
	}
	<-rc.ctx.Done()
	if !isRoot {
		mut := rc.buildMutation()
		mut.Operation = proto.RGQLValueMutation_VALUE_DELETE
		rc.messageChan <- &proto.RGQLServerMessage{
			MutateValue: mut,
		}
	}
	rc.wg.Done()
}

type TypeResolverPair struct {
	GqlType      ast.Node
	ResolverType reflect.Type
}

type ASTLookup interface {
	LookupType(ast.Type) ast.TypeDefinition
}

type ResolverMap map[TypeResolverPair]Resolver

type ResolverTree struct {
	Resolvers ResolverMap
	Lookup    ASTLookup
}

func NewResolverTree(lookup ASTLookup) *ResolverTree {
	return &ResolverTree{
		Resolvers: make(ResolverMap),
		Lookup:    lookup,
	}
}

// StartQuery begins executing a QueryTree
func StartQuery(r Resolver, ctx context.Context, rootResolver reflect.Value, tree *qtree.QueryTreeNode) *executionContext {
	qctx, qcancel := context.WithCancel(ctx)
	ec := &executionContext{
		rootContext: ctx,
		cancelFunc:  qcancel,
		messageChan: make(chan *proto.RGQLServerMessage, 50),
	}
	rc := &resolutionContext{
		ctx:              qctx,
		ctxCancel:        qcancel,
		executionContext: ec,
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
	go rc.waitCancel(true)
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
	default:
		return nil, fmt.Errorf("Unsupported kind %s", pair.GqlType.GetKind())
	}
}
