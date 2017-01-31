package qtree

import (
// proto "github.com/rgraphql/rgraphql/pkg/proto"
)

type QueryTreeNode struct {
	Id uint32

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
