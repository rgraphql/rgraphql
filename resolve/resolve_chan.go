package resolve

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

func (cv *chanValueResolver) Execute(rc *resolutionContext, value reflect.Value) {
	doneVal := reflect.ValueOf(rc.ctx.Done())
	if value.IsNil() {
		rc.SetValue(nil)
		return
	}

	var child *resolutionContext
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
		// Closing the channel, or canceling the context, results in Purge of the existing value.
		// Same with sending nil, for example.
		if child != nil {
			child.Purge()
		}
		if chosen == 1 || !recvOk {
			return
		}
		// TODO: check if nil?
		child = rc.Child(rc.qnode, false, false)
		go cv.elemResolver.Execute(child, recv)
	}
}

func (rt *ResolverTree) buildChanValueResolver(value reflect.Type, gtyp *ast.Named) (Resolver, error) {
	if rt.SerialOnly {
		return nil, fmt.Errorf("Cannot accept non-immediate result in mutations (at %s, mutations cannot return deferred values).", value.String())
	}

	if value.ChanDir() != reflect.RecvDir {
		return nil, fmt.Errorf("Invalid live-value type %s, (should be a %v, is a %v)", value.String(), reflect.RecvDir, value.ChanDir())
	}

	elemResolver, err := rt.buildFollowResolver(value.Elem(), gtyp)
	if err != nil {
		return nil, err
	}

	return &chanValueResolver{
		elemResolver: elemResolver,
	}, nil
}
