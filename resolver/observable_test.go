package resolver

import (
	"context"
	"testing"
)

func TestObservable(t *testing.T) {
	ctx := context.Background()
	obs := &Observable{}
	valCh := make(chan interface{}, 1)
	obs.Subscribe(ctx, func(v interface{}) {
		valCh <- v
	})

	select {
	case <-valCh:
		t.Fail()
	default:
	}

	obs.Set("test")
	select {
	case v := <-valCh:
		if v != "test" {
			t.Fail()
		}
	default:
		t.Fail()
	}
}
