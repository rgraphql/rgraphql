package resolver

import (
	"context"
	"sync"

	"github.com/rgraphql/rgraphql/varstore"

	proto "github.com/rgraphql/rgraphql"
	"github.com/rgraphql/rgraphql/qtree"
)

// Context implements the resolver context.
// This context tracks:
// - Current query tree node
// - Position in output (for result encoding)
// - If we are an element in an array or not
type Context struct {
	// Context is the cancellation context
	Context context.Context
	// ContextCancel is the cancellation context cancel func
	ContextCancel context.CancelFunc

	// QNode is the query tree node
	QNode *qtree.QueryTreeNode
	// PathParent is the next parent in the chain that has a path component.
	PathParent *Context
	// PathComponent is the path component.
	// This is sometimes nil (TODO: when?)
	PathComponent *proto.RGQLValue

	// PathMtx locks the path components.
	PathMtx sync.Mutex
	// IsFinal indicates the context is finalized
	IsFinal bool
	// ActiveChildren is the number of active resolver children.
	ActiveChildren int

	// writer is the value writer.
	writer ValueWriter
}

// ValueWriter handles writing values for fields.
type ValueWriter interface {
	WriteValue(ctx context.Context, value *Value)
}

// NewContext builds a new root context.
func NewContext(ctx context.Context, qnode *qtree.QueryTreeNode, writer ValueWriter) *Context {
	rctx, rctxCancel := context.WithCancel(ctx)
	return &Context{
		Context:       rctx,
		ContextCancel: rctxCancel,

		QNode: qnode,

		writer: writer,
	}
}

// WriteValue writes the value at the position.
func (c *Context) WriteValue(val *Value, isFinal bool) {
	if c.PathComponent == nil {
		c.PathParent.WriteValue(val, isFinal)
		return
	}

	if isFinal {
		c.MarkFinal()
	}

	val.Context = c
	c.writer.WriteValue(c.Context, val)
}

// MarkFinal marks the context as complete.
func (c *Context) MarkFinal() {
	c.PathMtx.Lock()
	defer c.PathMtx.Unlock()

	if c.IsFinal {
		return
	}

	c.IsFinal = true
	if c.PathParent != nil {
		c.PathParent.markChildFinal()
	}
}

// markChildFinal indicates a child has been finalized.
func (c *Context) markChildFinal() {
	c.PathMtx.Lock()
	defer c.PathMtx.Unlock()

	if c.ActiveChildren > 0 {
		c.ActiveChildren--
	}
	if c.ActiveChildren == 0 {
		c.IsFinal = true
		if c.PathParent != nil {
			c.PathParent.markChildFinal()
		}
	}
}

// SetError marks an error on the resolver node.
func (c *Context) SetError(err error) {
	c.WriteValue(BuildErrorValue(err), true)
}

// baseChild builds the base child resolver context object.
func (c *Context) baseChild(pathComponent *proto.RGQLValue) *Context {
	result := &Context{
		PathComponent: pathComponent,
		QNode:         c.QNode,

		writer: c.writer,
	}

	result.Context, result.ContextCancel = context.WithCancel(c.Context)
	if c.PathComponent != nil {
		result.PathParent = c
	} else {
		result.PathParent = c.PathParent
	}

	result.PathMtx.Lock()
	result.ActiveChildren++
	result.IsFinal = false
	result.PathMtx.Unlock()

	return result
}

// FieldChild builds a child resolver context for a field resolver.
func (c *Context) FieldChild(qnode *qtree.QueryTreeNode) *Context {
	child := c.baseChild(&proto.RGQLValue{QueryNodeId: qnode.Id})
	child.QNode = qnode
	return child
}

// ArrayChild builds a child resolver context with an index in an array.
func (c *Context) ArrayChild(index uint32) *Context {
	return c.baseChild(&proto.RGQLValue{ArrayIndex: index + 1})
}

// GetQueryArgument returns a query argument by argument name.
func (c *Context) GetQueryArgument(argName string) *varstore.VariableReference {
	if c.QNode == nil || c.QNode.Arguments == nil {
		return nil
	}
	return c.QNode.Arguments[argName]
}

// VirtualChild builds a virtual child resolver context that can be canceled
// if/when a new value becomes available.
func (c *Context) VirtualChild() *Context {
	return c.baseChild(nil)
}

// Purge cancels the context.
func (c *Context) Purge() {
	c.ContextCancel()
}
