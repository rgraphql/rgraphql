package qtree

import (
	"sync"
)

type QTNodeOperation int

const (
	Operation_AddChild QTNodeOperation = iota
	Operation_DelChild
	Operation_Delete
)

// A update to a QueryTreeNode
type QTNodeUpdate struct {
	Operation QTNodeOperation
	Child     *QueryTreeNode
}

type qtNodeSubscription struct {
	id      uint32
	node    *QueryTreeNode
	mtx     sync.RWMutex
	chChans []chan<- *QTNodeUpdate
}

func (sub *qtNodeSubscription) nextChange(upd *QTNodeUpdate) {
	sub.mtx.RLock()
	defer sub.mtx.RUnlock()

	for _, ch := range sub.chChans {
		select {
		case ch <- upd:
		default:
		}
	}
}

func (sub *qtNodeSubscription) Changes() <-chan *QTNodeUpdate {
	nch := make(chan *QTNodeUpdate, 50)
	sub.mtx.Lock()
	sub.chChans = append(sub.chChans, nch)
	sub.mtx.Unlock()
	return nch
}

func (sub *qtNodeSubscription) Unsubscribe() {
	sub.node.removeSubscription(sub.id)
}

// A subscription to changes to the node
type QTNodeSubscription interface {
	Changes() <-chan *QTNodeUpdate
	Unsubscribe()
}
