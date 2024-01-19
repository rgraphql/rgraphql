package client

import (
	"fmt"

	proto "github.com/rgraphql/rgraphql"
)

// jsonDecoderHandler attaches a position in the result tree.
type jsonDecoderHandler struct {
	// resultLock locks the result and calls cb()
	resultLock func(cb func())
	// qnode is the query tree node.
	qnode *qtNode
	// result is the referenced position in the result
	result map[string]interface{}
}

// newJsonDecoderHandler builds a new decoder handler.
func newJsonDecoderHandler(
	resultLock func(cb func()),
	result map[string]interface{},
	qtNode *qtNode,
) *jsonDecoderHandler {
	return &jsonDecoderHandler{
		resultLock: resultLock,
		result:     result,
		qnode:      qtNode,
	}
}

// HandleResultValue handles the next value in the sequence, optionally
// returning a handler for the next value(s) in the sequence.
func (d *jsonDecoderHandler) HandleResultValue(val *proto.RGQLValue) (nextHandler ResultTreeHandler) {
	d.resultLock(func() {
		// Query node, bind new decoder handler to object + field name.
		if qnodeID := val.GetQueryNodeId(); qnodeID != 0 {
			qchild := d.qnode.lookupChildByID(qnodeID)
			if qchild == nil {
				return
			}
			fieldName := qchild.name
			rchild, ok := d.result[fieldName]
			// TODO: We don't know if we need an array or a object here.
			if !ok {
				rchild = make(map[string]interface{})
				d.result[fieldName] = rchild
			}
			rchildMap := rchild.(map[string]interface{})
			nextHandler = newJsonDecoderHandler(
				d.resultLock,
				rchildMap,
				qchild,
			)
			return
		}

		// If array index, return handler bound to the array index.
		if arrayIdx := val.GetArrayIndex(); arrayIdx != 0 {
			fmt.Printf("unhandled array index: %v\n", arrayIdx)
		}
	})
	return
}

var _ ResultTreeHandler = ((*jsonDecoderHandler)(nil))

// arrayChild clones the handler with an array index bound.
/*
func (d *jsonDecoderHandler) arrayChild(idx uint32) *jsonDecoderHandler {
	return &jsonDecoderHandler{
		resultLock: d.resultLock,
		result:     d.result,
		qnode:      d.qnode,
	}
}
*/
