package vtree

import (
	"github.com/rgraphql/magellan/qtree"
	"github.com/rgraphql/magellan/resolve"
)

type ValueTreeNode struct {
	Id uint32

	Parent   *ValueTreeNode
	Children []*ValueTreeNode
	Root     *ValueTreeNode

	QueryNode *qtree.QueryTreeNode
	Resolver  resolve.Resolver
}

func NewValueTree(queryTree *qtree.QueryTreeNode, rootResolver resolve.Resolver) *ValueTreeNode {
	nnode := &ValueTreeNode{
		Id:        0,
		QueryNode: queryTree,
		Resolver:  rootResolver,
	}
	nnode.Root = nnode
	return nnode
}

func (vt *ValueTreeNode) Execute() {
}
