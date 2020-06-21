package client

import (
	"github.com/rgraphql/magellan/types"
	"github.com/rgraphql/magellan/types/gqlast"
	"github.com/rgraphql/magellan/varstore"

	"github.com/graphql-go/graphql/language/ast"
	proto "github.com/rgraphql/rgraphql"
)

// schemaLookup looks up a type given a reference.
type schemaLookup func(ast.Type) ast.TypeDefinition

// qtNode is a node in the query tree.
type qtNode struct {
	// id is this query node id
	id uint32
	// name contains the field name associated with this qtNode
	name string
	// objDef contains the schema object definition for this node.
	// will be nil if this is a primitive.
	objDef *ast.ObjectDefinition
	// children contains the child nodes
	children []*qtNode
	// args contains the arguments
	// will be nil if there are no arguments.
	args argsMap
	// parent points to the parent node
	parent *qtNode

	// varStore contains a pointer to the variable store
	varStore *varstore.VariableStore
	// refCount is the number of references to the node
	refCount uint32
	// gcNext indicates this node should be swept
	gcNext bool
	// xmitted indicates this node has been transmitted
	xmitted bool
}

// newQtNode builds the root query tree node.
func newQtNode(objDef *ast.ObjectDefinition, varStore *varstore.VariableStore) *qtNode {
	return &qtNode{name: objDef.Name.Value, objDef: objDef, varStore: varStore}
}

// buildProto builds the proto representation of the node.
func (q *qtNode) buildProto() *proto.RGQLQueryTreeNode {
	children := make([]*proto.RGQLQueryTreeNode, len(q.children))
	for i := range q.children {
		children[i] = q.children[i].buildProto()
	}

	return &proto.RGQLQueryTreeNode{
		Id:        q.id,
		FieldName: q.name,
		Args:      q.args.BuildProto(),
		Children:  children,
	}
}

// flagGcNext marks the node for GC sweep.
func (q *qtNode) flagGcNext() {
	q.gcNext = true

	if q.parent != nil {
		q.parent.flagGcNext()
	}
}

// matchesField checks if the node matches the field.
func (q *qtNode) matchesField(f *ast.Field, args argsMap) bool {
	fieldName := f.Name.Value
	if fieldName != q.name {
		return false
	}

	// compare arguments
	return q.args.Equals(args)
}

// lookupChildByID looks for an existing child with a query node ID. reference count is not incremented.
// nil is returned if the node is not found.
func (q *qtNode) lookupChildByID(qnID uint32) *qtNode {
	for _, child := range q.children {
		if child.id == qnID {
			return child
		}
	}

	return nil
}

// resolveChild validates then matches or creates a child field selection.
func (q *qtNode) resolveChild(field *ast.Field, lookupType schemaLookup, allocNode func() *qtNode) (*qtNode, error) {
	// Find the field on the object.
	fieldName := field.Name.Value
	childFieldDef := q.findSchemaField(fieldName)
	if childFieldDef == nil {
		return nil, fieldNotFoundErr(fieldName, q.name)
	}

	var atdObj *ast.ObjectDefinition

	childFieldType := childFieldDef.Type
	childFieldTypeUnderlying := gqlast.UnwrapASTType(childFieldType)
	if !types.IsAstPrimitive(childFieldTypeUnderlying) {
		atd := lookupType(childFieldTypeUnderlying)
		if atd != nil {
			var atdOk bool
			atdObj, atdOk = atd.(*ast.ObjectDefinition)
			if !atdOk {
				atdObj = nil
			}
		}

		// Return error if the field type wasn't found.
		if atdObj == nil {
			ctName, ctOk := childFieldTypeUnderlying.(*ast.Named)
			if ctOk {
				return nil, typeNotFoundErr(ctName.Name.Value)
			}
			return nil, typeNotFoundErr("[unknown reference type]")
		}
	}

	// Match existing child.
	// build arguments map
	argsm, err := newArgsMapFromAst(q.varStore, field.Arguments)
	if err != nil {
		return nil, err
	}

	for _, child := range q.children {
		if child.matchesField(field, argsm) {
			return child, nil
		}
	}

	childNod := allocNode()
	childNod.varStore = q.varStore
	childNod.args = argsm
	childNod.name = fieldName
	childNod.objDef = atdObj
	childNod.parent = q
	q.children = append(q.children, childNod)
	return childNod, nil
}

// findSchemaField looks for the schema field on objDef.
func (q *qtNode) findSchemaField(fieldName string) *ast.FieldDefinition {
	if q.objDef == nil {
		return nil
	}

	for _, f := range q.objDef.Fields {
		if f.Name == nil {
			continue
		}

		if fieldName == f.Name.Value {
			return f
		}
	}

	return nil
}

// gcSweep GC sweeps the node and returns if there are any references.
// if the node has no references, will not emit any messages.
// each unreferenced child is deleted and emitted
// Untransmitted nodes are not emitted.
func (q *qtNode) gcSweep(purgeNodesCb func([]*qtNode)) bool {
	var unrefChildren []*qtNode
	if q.gcNext {
		q.gcNext = false
		for i := 0; i < len(q.children); i++ {
			child := q.children[i]
			if !child.gcSweep(purgeNodesCb) {
				q.children[i] = q.children[len(q.children)-1]
				q.children[len(q.children)-1] = nil
				q.children = q.children[:len(q.children)-1]
				if child.xmitted {
					unrefChildren = append(unrefChildren, child)
				}
				i--
			}
		}
	}

	qReferenced := q.refCount != 0 || q.parent == nil
	if len(unrefChildren) != 0 && qReferenced {
		purgeNodesCb(unrefChildren)
	}
	return qReferenced
}

// markXmitted marks the node as transmitted.
func (q *qtNode) markXmitted() {
	q.xmitted = true
}

// Query tree:
/*query {
    allPeople {
		name
	}
  }

  schema:

type Person {
	name: String
}

type RootQuery {
	allPeople: [Person]
}
  ->

  *qtNode<objDef: RootQuery>

*/
