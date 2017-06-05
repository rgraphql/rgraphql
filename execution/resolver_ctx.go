package execution

import (
	"context"
	"reflect"
	"sync"

	"github.com/rgraphql/magellan/qtree"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

// A ExecutionContext contains context for the entire resolver tree.
type ExecutionContext struct {
	Writer            ResolverWriter
	RootContext       context.Context
	RootContextCancel context.CancelFunc
	IsSerial          bool // Is the execution serial?
	QNodeRoot         *qtree.QueryTreeNode
}

// A ResolverContext is context passed to a resolver.
//
// Notes:
// 	- On object resolvers, ActiveChildren represents the number of pending fields.
// 	- When ActiveChildren is incremented from 0->1, IsFinal is set to false.
// 	- On array resolvers, ActiveChildren represents the number of pending array elements.
// 	- When ActiveChildren is decremented from 1->0, IsFinal is set to true and the parent is decremented.
type ResolverContext struct {
	*ExecutionContext

	Context       context.Context // The cancellation context
	ContextCancel context.CancelFunc
	Lock          sync.Mutex // Lock for the path identifier

	QNode         *qtree.QueryTreeNode // The query tree node.
	Parent        *ResolverContext     // The parent of this resolver ctx.
	PathParent    *ResolverContext     // The next parent in the chain that has a path component.
	PathComponent *proto.RGQLValue     // The path component, if necessary.

	IsFinal        bool                     // If this component is final (not going to receive another value)
	ActiveChildren uint32                   // Number of child resolvers that can emit new values in the future.
	PrimitiveKind  proto.RGQLPrimitive_Kind // If this component is a leaf, the primitive kind.
}

// ResolverWriter handles resolvers finding values for fields.
type ResolverWriter interface {
	WriteValue(value *ResolverValue)
}

// baseChild builds the base child resolver context object.
func (r *ResolverContext) baseChild(pathComponent *proto.RGQLValue) *ResolverContext {
	result := &ResolverContext{
		ExecutionContext: r.ExecutionContext,
		Parent:           r,
		PathComponent:    pathComponent,
		QNode:            r.QNode,
	}
	result.Context, result.ContextCancel = context.WithCancel(r.Context)

	if r.PathComponent != nil {
		result.PathParent = r
	} else {
		result.PathParent = r.PathParent
	}

	r.Lock.Lock()
	r.ActiveChildren++
	r.IsFinal = false
	r.Lock.Unlock()

	return result
}

// VirtualChild builds a child resolver context without a path.
func (r *ResolverContext) VirtualChild() *ResolverContext {
	return r.baseChild(nil)
}

// FieldChild builds a child resolver context for a field resolver.
func (r *ResolverContext) FieldChild(qnode *qtree.QueryTreeNode) *ResolverContext {
	child := r.baseChild(&proto.RGQLValue{QueryNodeId: qnode.Id})
	child.SetQueryNode(qnode)
	return child
}

// ArrayChild builds a child resolver context with an index in an array.
func (r *ResolverContext) ArrayChild(index int) *ResolverContext {
	return r.baseChild(&proto.RGQLValue{ArrayIndex: uint32(index + 1)})
}

// SetPrimitiveKind marks this context as a primitive and sets the kind.
func (r *ResolverContext) SetPrimitiveKind(kind proto.RGQLPrimitive_Kind) {
	r.PrimitiveKind = kind
}

// SetQueryNode sets the query tree node.
func (r *ResolverContext) SetQueryNode(qn *qtree.QueryTreeNode) {
	r.QNode = qn
}

// MarkFinal marks a leaf as final.
func (r *ResolverContext) MarkFinal() {
	r.Lock.Lock()
	defer r.Lock.Unlock()

	if r.IsFinal {
		return
	}
	r.IsFinal = true
	if r.PathParent != nil {
		r.PathParent.markChildFinal()
	}
}

// markChildFinal indicates a child has finalized.
func (r *ResolverContext) markChildFinal() {
	r.Lock.Lock()
	defer r.Lock.Unlock()

	if r.IsFinal || r.ActiveChildren == 0 {
		return
	}

	r.ActiveChildren--
	if r.ActiveChildren == 0 {
		r.IsFinal = true
		if r.PathParent != nil {
			r.PathParent.markChildFinal()
		}
	}
}

// Purge cancels the resolver context.
func (r *ResolverContext) Purge() {
	if r.ContextCancel != nil {
		r.ContextCancel()
	}
}

// SetValue transmits a value for this resolver.
func (r *ResolverContext) SetValue(value reflect.Value, isFinal bool) {
	if r.PathComponent == nil {
		r.PathParent.SetPrimitiveKind(r.PrimitiveKind)
		r.PathParent.SetValue(value, isFinal)
		return
	}

	rv := BuildResolverValue(r, r.PrimitiveKind, value)
	if isFinal {
		r.MarkFinal()
	}
	r.Writer.WriteValue(rv)
}

// SetError sets an error on the value.
func (r *ResolverContext) SetError(err error) {
	if r.PathComponent == nil {
		r.PathParent.SetError(err)
		return
	}

	r.Writer.WriteValue(&ResolverValue{Context: r, Error: err})
}

// NewRootResolverContext builds a root resolver context.
func NewRootResolverContext(ctx context.Context, writer ResolverWriter, serial bool, rootQueryTree *qtree.QueryTreeNode) *ResolverContext {
	nctx, nctxCancel := context.WithCancel(ctx)
	return &ResolverContext{
		ExecutionContext: &ExecutionContext{
			Writer:            writer,
			IsSerial:          serial,
			RootContext:       nctx,
			RootContextCancel: nctxCancel,
			QNodeRoot:         rootQueryTree,
		},
		Context:       nctx,
		ContextCancel: nctxCancel,
	}
}

// A primitive value as found by the resolver.
type ResolverValue struct {
	Context *ResolverContext
	Value   *proto.RGQLPrimitive
	Error   error
}

// BuildResolverValue builds the encoded value for a result.
func BuildResolverValue(ctx *ResolverContext, primKind proto.RGQLPrimitive_Kind, value reflect.Value) *ResolverValue {
	prim := &proto.RGQLPrimitive{Kind: primKind}

	if !value.IsValid() || (value.Kind() == reflect.Ptr && value.IsNil()) {
		prim.Kind = proto.RGQLPrimitive_PRIMITIVE_KIND_NULL
	} else {
		switch primKind {
		case proto.RGQLPrimitive_PRIMITIVE_KIND_INT:
			prim.IntValue = int32(value.Int())
		case proto.RGQLPrimitive_PRIMITIVE_KIND_BOOL:
			prim.BoolValue = value.Bool()
		case proto.RGQLPrimitive_PRIMITIVE_KIND_FLOAT:
			prim.FloatValue = value.Float()
		case proto.RGQLPrimitive_PRIMITIVE_KIND_STRING:
			prim.StringValue = value.String()
		}
	}

	return &ResolverValue{Context: ctx, Value: prim}
}
