package resolver

import (
	"context"
	"sync"
)

// Observable contains a value that can be subscribed to.
// The zero value is valid, with an empty val.
// Untyped nil is considered an empty value.
type Observable struct {
	mtx  sync.Mutex
	val  interface{}
	subs []*obsSub
}

// obsSub is an observable subscription
type obsSub struct {
	isCanceled func() bool
	emitValue  func(v interface{})
}

// NewObservable builds a new observable with an initial value.
func NewObservable(val interface{}) *Observable {
	return &Observable{val: val}
}

// Set sets the next value.
func (o *Observable) Set(val interface{}) {
	o.mtx.Lock()
	defer o.mtx.Unlock()
	o.val = val
	for i := 0; i < len(o.subs); i++ {
		sub := o.subs[i]
		if sub.isCanceled() {
			o.subs[i] = o.subs[len(o.subs)-1]
			o.subs[len(o.subs)-1] = nil
			o.subs = o.subs[:len(o.subs)-1]
			i--
			continue
		}

		sub.emitValue(val)
	}
}

// Get returns the current instantaneous value.
func (o *Observable) Get() interface{} {
	o.mtx.Lock()
	defer o.mtx.Unlock()
	return o.val
}

// Subscribe subscribes to the value.
func (o *Observable) Subscribe(ctx context.Context, write func(v interface{})) {
	o.mtx.Lock()
	defer o.mtx.Unlock()
	if o.val != nil {
		write(o.val)
	}
	o.subs = append(o.subs, &obsSub{
		isCanceled: func() bool {
			select {
			case <-ctx.Done():
				return true
			default:
				return false
			}
		},
		emitValue: write,
	})
}
