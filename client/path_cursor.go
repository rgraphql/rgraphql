package client

import (
	proto "github.com/rgraphql/rgraphql"
)

// PathCursor points to a location in the result tree.
type PathCursor struct {
	// qnode is the referenced query node
	qnode *qtNode
	// rnode is the referenced result node
	rnode *rtNode
	// maintain map of *rtNode -> []PathCursor (ptr to val in LRU)
	// when evicted, clear the value
	// when adding a new result handler, check this map / push the handler
	// when removing a result handler, do the same.
	resultHandlers []ResultTreeHandler
	// outOfBounds indicates the cursor is pointing out of the desired space.
	outOfBounds bool
}

// NewPathCursor builds a new path cursor.
func NewPathCursor(qnode *qtNode, rnode *rtNode) *PathCursor {
	return &PathCursor{qnode: qnode, rnode: rnode}
}

// Apply applies the value segment to the cursor.
func (c *PathCursor) Apply(val *proto.RGQLValue) {
	if c.outOfBounds {
		return
	}

	// qnode, check query_node_id
	// nrNode := c.rnode.lookupOrPushChild(val)
	var rtn *rtNode
	isQnode := val.GetQueryNodeId() != 0
	isArray := val.GetArrayIndex() != 0
	isValue := val.GetValue() != nil
	if isQnode {
		valQnID := val.GetQueryNodeId()
		nqn := c.qnode.lookupChildByID(valQnID)
		if nqn == nil {
			c.outOfBounds = true
			return
		}

		c.qnode = nqn

		// resolve result tree node
		for _, child := range c.rnode.children {
			if child.value.GetQueryNodeId() == valQnID {
				rtn = child
				break
			}
		}
	} else if isArray {
		// We expect query_node_id, then array_idx in two values
		// When we have query_node_id, the qnode is stepped, rnode stepped
		// Then when we have array_idx, qnode is left the same, rnode stepped.
		valArrIdx := val.GetArrayIndex()

		// Note: slow, the result tree is the primary point of future optimization
		for _, child := range c.rnode.children {
			if child.value.GetArrayIndex() == valArrIdx {
				rtn = child
				break
			}
		}
	} else {
		rtn = c.rnode
	}

	if rtn == nil {
		rtn = newRtNode(*val)
		c.rnode.children = append(c.rnode.children, rtn)
	} else if isValue {
		rtn.value = *val
	}

	nextHandlers := make([]ResultTreeHandler, 0, len(c.resultHandlers))
	for _, handler := range c.resultHandlers {
		nextHandler := handler.HandleResultValue(val)
		if nextHandler != nil {
			nextHandlers = append(nextHandlers, nextHandler)
		}
	}
	c.resultHandlers = nextHandlers
	c.rnode = rtn
	return
}

// Clone copies the cursor.
func (c *PathCursor) Clone() *PathCursor {
	return &PathCursor{
		qnode: c.qnode,
		rnode: c.rnode,

		outOfBounds:    c.outOfBounds,
		resultHandlers: c.resultHandlers,
	}
}
