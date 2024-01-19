package qtree

import (
	"fmt"
	"sync"

	"github.com/graphql-go/graphql/language/ast"
	proto "github.com/rgraphql/rgraphql"
	"github.com/rgraphql/rgraphql/types"
	"github.com/rgraphql/rgraphql/varstore"
)

// QueryTreeNode is a node in a tree of fields that describes a query.
type QueryTreeNode struct {
	Id uint32

	Root     *QueryTreeNode
	Parent   *QueryTreeNode
	Children []*QueryTreeNode

	RootNodeMap    map[uint32]*QueryTreeNode
	SchemaResolver SchemaResolver
	VariableStore  *varstore.VariableStore

	FieldName     string
	AST           ast.TypeDefinition
	IsPrimitive   bool
	PrimitiveName string
	Arguments     map[string]*varstore.VariableReference

	subCtr         uint32
	subscribers    map[uint32]*qtNodeSubscription
	subscribersMtx sync.Mutex

	err   error
	errCh chan<- *proto.RGQLQueryError

	disposeChan chan struct{}
	disposeOnce sync.Once
}

// NewQueryTree builds a new query tree given the RootQuery AST object and a schemaResolver to lookup types.
func NewQueryTree(rootQuery *ast.ObjectDefinition,
	schemaResolver SchemaResolver,
	errorCh chan<- *proto.RGQLQueryError) *QueryTreeNode {
	nqt := &QueryTreeNode{
		Id:             0,
		RootNodeMap:    map[uint32]*QueryTreeNode{},
		AST:            rootQuery,
		SchemaResolver: schemaResolver,
		VariableStore:  varstore.NewVariableStore(nil),
		subscribers:    make(map[uint32]*qtNodeSubscription),
		errCh:          errorCh,
		disposeChan:    make(chan struct{}),
	}
	nqt.Root = nqt
	nqt.RootNodeMap[0] = nqt
	return nqt
}

// ApplyTreeMutation applies a tree mutation to the query tree. Errors leave nodes in a failed state.
func (qt *QueryTreeNode) ApplyTreeMutation(mutation *proto.RGQLQueryTreeMutation) {
	// Apply all variables.
	for _, variable := range mutation.Variables {
		qt.VariableStore.Put(variable)
	}

	for _, aqn := range mutation.NodeMutation {
		// Find the node we are operating on.
		nod, ok := qt.Root.RootNodeMap[aqn.NodeId]
		if !ok {
			continue
		}

		switch aqn.Operation {
		case proto.RGQLQueryTreeMutation_SUBTREE_ADD_CHILD:
			_ = nod.AddChild(aqn.Node)
		case proto.RGQLQueryTreeMutation_SUBTREE_DELETE:
			if aqn.NodeId != 0 && nod != qt.Root {
				nod.Dispose()
			}
		}
	}

	// Garbage collect variables
	qt.VariableStore.GarbageCollect()
}

// AddChild validates and adds a child tree.
func (qt *QueryTreeNode) AddChild(data *proto.RGQLQueryTreeNode) (addChildErr error) {
	if _, ok := qt.RootNodeMap[data.Id]; ok {
		return fmt.Errorf("invalid node ID (already exists): %d", data.Id)
	}

	// Mint the new node.
	nnod := &QueryTreeNode{
		Id:             data.Id,
		Parent:         qt,
		Root:           qt.Root,
		SchemaResolver: qt.SchemaResolver,
		VariableStore:  qt.VariableStore,
		FieldName:      data.FieldName,
		errCh:          qt.errCh,
		subscribers:    make(map[uint32]*qtNodeSubscription),
		disposeChan:    make(chan struct{}),
	}
	// TODO: Mutex
	qt.Root.RootNodeMap[nnod.Id] = nnod
	qt.Children = append(qt.Children, nnod)

	defer func() {
		if addChildErr != nil {
			nnod.SetError(addChildErr)
		}
	}()

	// Figure out the AST for this child.
	od, ok := qt.AST.(*ast.ObjectDefinition)
	if !ok {
		return fmt.Errorf("invalid node %d, parent is not selectable", data.Id)
	}

	var selectedField *ast.FieldDefinition
	if data.FieldName == "__typename" {
		selectedField = typeNameDef
	} else {
		for _, field := range od.Fields {
			name := field.Name.Value
			if name == data.FieldName {
				selectedField = field
				break
			}
		}
	}

	if selectedField == nil {
		return fmt.Errorf("invalid field %q on %q", data.FieldName, od.Name.Value)
	}

	selectedType := selectedField.Type
	if stl, ok := selectedType.(*ast.List); ok {
		selectedType = stl.Type
	}

	isPrimitive := false
	var primitiveName string
	var selectedTypeDef ast.TypeDefinition
	var namedType *ast.Named

	if n, ok := selectedType.(*ast.NonNull); ok {
		selectedType = n.Type
	}

	if n, ok := selectedType.(*ast.Named); ok {
		namedType = n
		if types.IsPrimitive(n.Name.Value) {
			primitiveName = n.Name.Value
			isPrimitive = true
		}
	}

	if selectedTypeDef == nil && !isPrimitive {
		selectedTypeDef = qt.SchemaResolver.LookupType(selectedType)
		if selectedTypeDef == nil {
			if namedType != nil {
				return fmt.Errorf("unable to resolve named %q", namedType.Name.Value)
			}
			return fmt.Errorf("unable to resolve type %#v", selectedType)
		}
	}

	argMap := make(map[string]*varstore.VariableReference)
	for _, arg := range data.Args {
		vref := qt.VariableStore.Get(arg.VariableId)
		if vref == nil {
			// Cleanup a bit
			for _, marg := range argMap {
				marg.Unsubscribe()
			}
			return fmt.Errorf("variable id %d not found for argument %q", arg.VariableId, arg.Name)
		}
		argMap[arg.Name] = vref
	}

	nnod.AST = selectedTypeDef
	nnod.IsPrimitive = isPrimitive
	nnod.PrimitiveName = primitiveName
	nnod.Arguments = argMap

	// Apply any children
	for _, child := range data.Children {
		_ = nnod.AddChild(child)
	}

	// Apply to the resolver tree (start resolution for this node).
	qt.nextUpdate(&QTNodeUpdate{
		Operation: Operation_AddChild,
		Child:     nnod,
	})
	return nil
}

// removeChild deletes the given child from the children array.
func (qt *QueryTreeNode) removeChild(nod *QueryTreeNode) {
	for i, item := range qt.Children {
		if item == nod {
			a := qt.Children
			copy(a[i:], a[i+1:])
			a[len(a)-1] = nil
			qt.Children = a[:len(a)-1]
			qt.nextUpdate(&QTNodeUpdate{
				Operation: Operation_DelChild,
				Child:     item,
			})
			break
		}
	}
}

// SetError marks a query tree node as invalid against the schema.
func (qt *QueryTreeNode) SetError(err error) {
	if qt.err == err {
		return
	}
	qt.err = err
	qt.errCh <- &proto.RGQLQueryError{
		Error:       err.Error(),
		QueryNodeId: qt.Id,
	}
	// Note: this is not currently observed anywhere.
	qt.nextUpdate(&QTNodeUpdate{
		Operation: Operation_Error,
	})
}

// Error returns any error the node might have.
// TODO: Add mechanism to communicate query tree errors.
func (qt *QueryTreeNode) Error() error {
	return qt.err
}

func (qt *QueryTreeNode) removeSubscription(id uint32) {
	qt.subscribersMtx.Lock()
	delete(qt.subscribers, id)
	qt.subscribersMtx.Unlock()
}

// SubscribeChanges subscribes to changes to the query tree node.
func (qt *QueryTreeNode) SubscribeChanges() QTNodeSubscription {
	qt.subscribersMtx.Lock()
	defer qt.subscribersMtx.Unlock()

	nsub := &qtNodeSubscription{
		id:   qt.subCtr,
		node: qt,
	}
	qt.subCtr++
	qt.subscribers[nsub.id] = nsub
	return nsub
}

func (qt *QueryTreeNode) nextUpdate(update *QTNodeUpdate) {
	qt.subscribersMtx.Lock()
	defer qt.subscribersMtx.Unlock()

	for _, sub := range qt.subscribers {
		sub.nextChange(update)
	}
}

// Done returns a channel that is closed when the node is disposed.
func (qt *QueryTreeNode) Done() <-chan struct{} {
	return qt.disposeChan
}

// Dispose deletes the node and all children.
func (qt *QueryTreeNode) Dispose() {
	if qt == nil {
		return
	}
	qt.disposeOnce.Do(func() {
		if qt.disposeChan != nil {
			close(qt.disposeChan)
		}
		qt.nextUpdate(&QTNodeUpdate{
			Operation: Operation_Delete,
		})
		for _, child := range qt.Children {
			child.Dispose()
		}
		qt.Children = nil
		if qt.Root != nil && qt.Root.RootNodeMap != nil {
			delete(qt.Root.RootNodeMap, qt.Id)
		}
		if qt.Parent != nil {
			qt.Parent.removeChild(qt)
		}
		if qt.Arguments != nil {
			for _, arg := range qt.Arguments {
				arg.Unsubscribe()
			}
			qt.Arguments = nil
		}
	})
}
