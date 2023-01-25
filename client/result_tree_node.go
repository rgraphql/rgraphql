package client

import (
	proto "github.com/rgraphql/rgraphql"
)

// rtNode is a node in the result tree
type rtNode struct {
	value    *proto.RGQLValue
	children []*rtNode
}

// newRtNode builds a new result tree node.
func newRtNode(val *proto.RGQLValue) *rtNode {
	return &rtNode{value: val}
}

// callHandler recursively calls handlers with the contents of the tree.
// cb is called with each *rtNode and handler combo
func (n *rtNode) callHandler(handler ResultTreeHandler, cb func(*rtNode, ResultTreeHandler)) {
	for _, child := range n.children {
		nextHandler := handler.HandleResultValue(child.value)
		if nextHandler != nil {
			cb(child, nextHandler)
			child.callHandler(nextHandler, cb)
		}
	}
}

// func (n *rtNode) findIndex()
