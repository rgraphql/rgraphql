package simple

import (
	"context"
	"time"

	"github.com/rgraphql/magellan/resolver"
)

// RootResolver resolves RootQuery
type RootResolver struct {
	personObs resolver.Observable
}

// GetCounter returns the counter value.
func (r *RootResolver) GetCounter(ctx context.Context, outCh chan<- int) {
	var v int
	for {
		select {
		case <-ctx.Done():
			return
		case <-time.After(time.Second):
			v++
			outCh <- v
		}
	}
}

// GetSinglePerson returns a single person.
func (r *RootResolver) GetSinglePerson(ctx context.Context, outCh chan<- *PersonResolver) {
	go func() {
		r.personObs.Set(&PersonResolver{name: "Chandler"})
	}()
	r.personObs.Subscribe(ctx, func(v interface{}) {
		outCh <- v.(*PersonResolver)
	})
}

// Names resolves the names field.
func (r *RootResolver) Names(ctx context.Context, outCh chan<- string) error {
	vals := []string{"test1", "test2"}
	for i := range vals {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case outCh <- vals[i]:
		}
	}

	return nil
}

// AllPeople returns the list of all people.
func (r *RootResolver) AllPeople() []*PersonResolver {
	return []*PersonResolver{
		&PersonResolver{name: "Steve", height: 6},
		&PersonResolver{name: "Chris", height: 5},
	}
}

// PersonResolver resolves a person.
type PersonResolver struct {
	name   string
	height int
}

// Name returns the name of the person.
func (p *PersonResolver) Name() string {
	return p.name
}

// Height returns the height of the person.
func (p *PersonResolver) Height() int {
	return p.height
}
