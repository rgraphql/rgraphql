package qtree

import (
	"errors"
	"fmt"

	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

type QueryTreeNode struct {
	Id        uint32
	idCounter uint32

	Root     *QueryTreeNode
	Parent   *QueryTreeNode
	Children []*QueryTreeNode

	RootNodeMap map[uint32]*QueryTreeNode
	FieldName   string

	// TODO:
	// When we mint this node, we want a pointer to the schema node.
	// This should allow us to know what arguents are required.
	// Furthermore, we can actually instantiate the argument object
	// as requested by the resolver. Thus, we don't need to save FieldArguments
}

func NewQueryTree() *QueryTreeNode {
	nqt := &QueryTreeNode{
		Id:          0,
		RootNodeMap: make(map[uint32]*QueryTreeNode),
	}
	nqt.Root = nqt
	return nqt
}

// Apply a tree mutation to the tree.
func (qt *QueryTreeNode) ApplyTreeMutation(aqn *proto.RGQLTreeMutation) error {
	// Find the node we are operating on.
	nod, ok := qt.Root.RootNodeMap[aqn.NodeId]
	if !ok {
		return fmt.Errorf("Unable to find target node %d.", aqn.NodeId)
	}

	switch aqn.Operation {
	case proto.RGQLTreeMutation_SUBTREE_ADD_CHILD:
		return nod.AddChild(aqn.Node)
	case proto.RGQLTreeMutation_SUBTREE_DELETE:
		if aqn.NodeId == 0 || nod == qt.Root {
			return errors.New("You cannot delete the root node.")
		}
		nod.Dispose()
		return nil
	default:
		return fmt.Errorf("Unknown mutation type %v", aqn.Operation)
	}
}

// AddChild validates and adds a child tree.
func (qt *QueryTreeNode) AddChild(data *proto.RGQLQueryTreeNode) (addChildErr error) {
	if _, ok := qt.RootNodeMap[data.Id]; ok {
		return fmt.Errorf("Invalid node ID (already exists): %d", data.Id)
	}

	// Mint the new node.
	// TODO: handle arguments, field name, etc.
	nnod := &QueryTreeNode{
		Id:     data.Id,
		Parent: qt,
		Root:   qt.Root,
	}
	qt.Children = append(qt.Children, nnod)

	// Early failout cleanup defer.
	defer func() {
		if addChildErr != nil {
			qt.removeChild(nnod)
		}
	}()

	// Apply any children
	for _, child := range data.Children {
		if err := nnod.AddChild(child); err != nil {
			return err
		}
	}

	// Apply to the resolver tree (start resolution for this node).
	// NOTE: just do this on the topmost newly applied leaf in the tree.
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
			break
		}
	}
}

// Dispose deletes the node and all children.
func (qt *QueryTreeNode) Dispose() {
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
}
