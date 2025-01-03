package result

import (
	"context"
	"sync"
	"time"

	proto "github.com/rgraphql/rgraphql"
)

// MaxBatchSize is the maximum size of a batch, in bytes
// 8192 minus some margin for boxing
var MaxBatchSize uint32 = 8110

// ResultMultiplexer manages multiple result trees and merges them into one connection
type ResultTreeMultiplexer struct {
	ctx                context.Context
	outpChan           chan<- *proto.RGQLServerMessage
	addTreeChan        chan QueryExecution
	mu                 sync.Mutex
	trees              map[uint32]*executionTree
	previousPendingId  uint32
	previousPendingVal []byte
	pendingChan        chan struct{}
}

type executionTree struct {
	exec   QueryExecution
	output <-chan []byte
}

// NewResultTreeMultiplexer builds and starts a result tree multiplexer.
func NewResultTreeMultiplexer(ctx context.Context, output chan<- *proto.RGQLServerMessage) *ResultTreeMultiplexer {
	res := &ResultTreeMultiplexer{
		ctx:         ctx,
		outpChan:    output,
		addTreeChan: make(chan QueryExecution, 5),
		trees:       make(map[uint32]*executionTree),
		pendingChan: make(chan struct{}, 1),
	}
	go res.runMultiplexer()
	return res
}

// AddExecution assigns a query execution an ID and starts monitoring it until it is canceled.
func (r *ResultTreeMultiplexer) AddExecution(exec QueryExecution) {
	r.addTreeChan <- exec
}

// send sends a message on the channel with timeout.
func (r *ResultTreeMultiplexer) send(msg *proto.RGQLServerMessage) bool {
	select {
	case <-r.ctx.Done():
		return false
	case r.outpChan <- msg:
		return true
	case <-time.After(time.Second):
		return false
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
	var treeId uint32 = 1
	defer r.cleanup()

	for {
		select {
		case <-r.ctx.Done():
			return

		case nexec := <-r.addTreeChan:
			// Create new execution tree
			tree := &executionTree{
				exec:   nexec,
				output: nexec.Output(),
			}

			r.mu.Lock()
			id := treeId
			treeId++
			r.trees[id] = tree
			r.mu.Unlock()

			r.sendTreeInit(id, nexec)
			go r.handleTree(id, tree)

		case <-r.pendingChan:
			if r.previousPendingId != 0 {
				r.mu.Lock()
				if _, exists := r.trees[r.previousPendingId]; exists {
					r.processPendingValue(r.previousPendingId, r.previousPendingVal)
				}
				r.previousPendingId = 0
				r.previousPendingVal = nil
				r.mu.Unlock()
			}
		}
	}
}

// handleTree processes messages from a single execution tree
func (r *ResultTreeMultiplexer) handleTree(id uint32, tree *executionTree) {
	values := make([][]byte, 0, 32) // Pre-allocate with reasonable capacity
	var valuesSize int

	for {
		select {
		case <-r.ctx.Done():
			return

		case val, ok := <-tree.output:
			if !ok {
				r.sendTreeRemove(id)
				r.mu.Lock()
				delete(r.trees, id)
				r.mu.Unlock()
				return
			}

			if valuesSize+len(val) > int(MaxBatchSize) {
				// Send current batch
				if len(values) > 0 {
					r.sendBatch(&proto.RGQLValueBatch{
						ResultId: id,
						Values:   values,
					})
				}
				// Start new batch with this value
				values = [][]byte{val}
				valuesSize = len(val)
			} else {
				values = append(values, val)
				valuesSize += len(val)
			}

			// Try to read more values without blocking
			tryRead := true
			for tryRead && valuesSize < int(MaxBatchSize) {
				select {
				case val, ok := <-tree.output:
					if !ok {
						tryRead = false
						break
					}
					if valuesSize+len(val) > int(MaxBatchSize) {
						// Save for next batch
						r.mu.Lock()
						if _, exists := r.trees[id]; exists {
							r.previousPendingId = id
							r.previousPendingVal = val
							// Signal that we have pending data
							select {
							case r.pendingChan <- struct{}{}:
							default:
							}
						}
						r.mu.Unlock()
						tryRead = false
					} else {
						values = append(values, val)
						valuesSize += len(val)
					}
				default:
					tryRead = false
				}
			}

			// Send batch if we have values
			if len(values) > 0 {
				r.sendBatch(&proto.RGQLValueBatch{
					ResultId: id,
					Values:   values,
				})
				values = values[:0] // Reuse the slice
				valuesSize = 0
			}
		}
	}
}

// processPendingValue handles a previously pending value
func (r *ResultTreeMultiplexer) processPendingValue(id uint32, val []byte) {
	r.sendBatch(&proto.RGQLValueBatch{
		ResultId: id,
		Values:   [][]byte{val},
	})
}

// cleanup handles graceful shutdown of the multiplexer
func (r *ResultTreeMultiplexer) cleanup() {
	r.mu.Lock()
	defer r.mu.Unlock()

	// Clean up pending values
	r.previousPendingId = 0
	r.previousPendingVal = nil

	// Clean up trees
	for id := range r.trees {
		r.sendTreeRemove(id)
		delete(r.trees, id)
	}
}
