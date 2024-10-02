package result

import (
	"context"
	"reflect"

	proto "github.com/rgraphql/rgraphql"
)

// MaxBatchSize is the maximum size of a batch, in bytes
// 8192 minus some margin for boxing
var MaxBatchSize uint32 = 8110

// ResultMultiplexer manages multiple result trees and merges them into one connection
type ResultTreeMultiplexer struct {
	ctx         context.Context
	outpChan    chan<- *proto.RGQLServerMessage
	addTreeChan chan QueryExecution
}

// NewResultTreeMultiplexer builds and starts a result tree multiplexer.
func NewResultTreeMultiplexer(ctx context.Context, output chan<- *proto.RGQLServerMessage) *ResultTreeMultiplexer {
	res := &ResultTreeMultiplexer{
		ctx:         ctx,
		outpChan:    output,
		addTreeChan: make(chan QueryExecution, 5),
	}
	go res.runMultiplexer()
	return res
}

// AddExecution assigns a query execution an ID and starts monitoring it until it is canceled.
func (r *ResultTreeMultiplexer) AddExecution(exec QueryExecution) {
	r.addTreeChan <- exec
}

// send sends a message on the channel.
func (r *ResultTreeMultiplexer) send(msg *proto.RGQLServerMessage) {
	select {
	case <-r.ctx.Done():
		return
	case r.outpChan <- msg:
	}
}

// sendTreeInit informs a remote of a new result tree.
func (r *ResultTreeMultiplexer) sendTreeInit(id uint32, ex QueryExecution) {
	r.send(&proto.RGQLServerMessage{
		ValueInit: &proto.RGQLValueInit{
			ResultId:      id,
			QueryId:       ex.QueryId(),
			CacheSize:     ex.CacheSize(),
			CacheStrategy: ex.CacheStrategy(),
		},
	})
}

// sendTreeRemove informs a remote that there will be no further updates to a result.
func (r *ResultTreeMultiplexer) sendTreeRemove(id uint32) {
	r.send(&proto.RGQLServerMessage{
		ValueFinalize: &proto.RGQLValueFinalize{
			ResultId: id,
		},
	})
}

// sendBatch sends a batch of values out.
func (r *ResultTreeMultiplexer) sendBatch(batch *proto.RGQLValueBatch) {
	r.send(&proto.RGQLServerMessage{
		ValueBatch: batch,
	})
}

// runMultiplexer manages the multiplexer.
func (r *ResultTreeMultiplexer) runMultiplexer() {
	ctx := r.ctx
	/*
		defer func() {
			close(r.outpChan)
		}()
	*/

	selCases := []reflect.SelectCase{
		// Case 0: the context is cancelled.
		{
			Chan: reflect.ValueOf(ctx.Done()),
			Dir:  reflect.SelectRecv,
		},
		// Case 1: there is a new result tree to add.
		{
			Chan: reflect.ValueOf(r.addTreeChan),
			Dir:  reflect.SelectRecv,
		},
	}

	var treeId uint32 = 1
	treeIds := make(map[uintptr]uint32)
	var previousPendingId uint32
	var previousPendingVal []byte
	for {
		var id uint32

		if previousPendingId != 0 {
			// Add a default case.
			selCases = append(selCases, reflect.SelectCase{
				Dir: reflect.SelectDefault,
			})
		}

		chosen, recv, recvOk := reflect.Select(selCases)
		switch chosen {
		case 0:
			return
		case 1:
			nexec := recv.Interface().(QueryExecution)
			nch := reflect.ValueOf(nexec.Output())
			selCases = append(selCases, reflect.SelectCase{
				Chan: nch,
				Dir:  reflect.SelectRecv,
			})

			id = treeId
			treeId++
			treeIds[nch.Pointer()] = id
			r.sendTreeInit(id, nexec)
			continue

		default:
		}

		var values [][]byte
		var valuesSize int
		addToValues := func(val []byte) {
			values = append(values, val)
			valuesSize += len(val)
		}

		if previousPendingId != 0 {
			// Remove the temporary default case
			selCases = selCases[:len(selCases)-1]
		}

		// If we chose the default case, then use the previous pending value.
		if chosen == len(selCases) {
			id = previousPendingId
			addToValues(previousPendingVal)
			previousPendingId = 0
			previousPendingVal = nil
		} else {
			// Pull the current value.
			chPtr := selCases[chosen].Chan.Pointer()
			id = treeIds[chPtr]
			// If we previously had data pending for this, then make sure we include it.
			if id == previousPendingId {
				addToValues(previousPendingVal)
				previousPendingId = 0
				previousPendingVal = nil
			}

			// If the channel is closed, remove the tree.
			if !recvOk {
				r.sendTreeRemove(id)
				selCases[chosen] = selCases[len(selCases)-1]
				selCases = selCases[:len(selCases)-1]
				delete(treeIds, chPtr)
			} else {
				// Append the data to the values.
				addToValues(recv.Bytes())
			}
		}

		if valuesSize == 0 {
			continue
		}

		if chosen < len(selCases) && previousPendingId == 0 {
			for valuesSize < int(MaxBatchSize) {
				// Check if we can include any more data in this batch.
				mchosen, mrecv, mrecvOk := reflect.Select([]reflect.SelectCase{
					// Case: there is more data.
					selCases[chosen],
					// Case: there is not more data.
					{Dir: reflect.SelectDefault},
				})
				// If the channel is closed, it will be handled next spin.
				if !mrecvOk || mchosen == 1 {
					break
				}
				val := mrecv.Bytes()
				// If adding this chunk would make the batch too big, defer it to later.
				if valuesSize+len(val) > int(MaxBatchSize) {
					previousPendingId = id
					previousPendingVal = val
					break
				}
				// Add the chunk to this batch.
				addToValues(val)
			}
		}

		// Send the batch to the client.
		r.sendBatch(&proto.RGQLValueBatch{
			ResultId: id,
			Values:   values,
		})
	}
}
