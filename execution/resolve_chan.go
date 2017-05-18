package execution

import (
	"fmt"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
)

// A chan value creates a stream of values over time.
// This can be leveraged to make complex live fields or arrays.
type chanValueResolver struct {
	elemResolver Resolver
}

// Execute handles a chan value.
func (cv *chanValueResolver) Execute(rc *ResolverContext, value reflect.Value) {
	doneVal := reflect.ValueOf(rc.Context.Done())
	if value.IsNil() {
		rc.SetValue(reflect.ValueOf(nil), true)
		return
	}

	var child *ResolverContext
	for {
		chosen, recv, recvOk := reflect.Select([]reflect.SelectCase{
			{
				Chan: value,
				Dir:  reflect.SelectRecv,
			},
			{
				Chan: doneVal,
				Dir:  reflect.SelectRecv,
			},
		})
		if chosen == 1 || !recvOk {
			if child != nil {
				child.Purge()
			}
			return
		}
		if child == nil {
			child = rc.VirtualChild()
		}
		go cv.elemResolver.Execute(child, recv)
	}
}

// buildChanValueResolver builds a resolver to handle a channel representing a live value.
func (rt *modelBuilder) buildChanValueResolver(value reflect.Type, gtyp ast.Node) (Resolver, error) {
	if rt.SerialOnly {
		return nil, fmt.Errorf("Cannot accept non-immediate result in mutations (at %s, mutations cannot return deferred values).", value.String())
	}

	if value.ChanDir() != reflect.RecvDir {
		return nil, fmt.Errorf("Invalid live-value type %s, (should be a %v, is a %v)", value.String(), reflect.RecvDir, value.ChanDir())
	}

	elemResolver, err := rt.buildResolver(typeResolverPair{
		Type:         gtyp,
		ResolverType: value.Elem(),
	})
	if err != nil {
		return nil, err
	}

	return &chanValueResolver{
		elemResolver: elemResolver,
	}, nil
}
