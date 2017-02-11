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
		if chosen == 1 || !recvOk {
			return
		}
		if child != nil {
			child.ctxCancel()
		}
		child = rc.Child(rc.qnode, false)
		go cv.elemResolver.Execute(child, recv)
	}
}

func (rt *ResolverTree) buildChanValueResolver(value reflect.Type, gtyp *ast.Named) (Resolver, error) {
	if value.ChanDir() != reflect.RecvDir {
		return nil, fmt.Errorf("Invalid live-value type %s, (should be a %v, is a %v)", value.String(), reflect.RecvDir, value.ChanDir())
	}

	elemResolver, err := rt.buildFollowResolver(value.Elem(), gtyp)
	if err != nil {
		return nil, err
	}

	fmt.Printf("Built chan value resolver for %v\n", value.String())
	return &chanValueResolver{
		elemResolver: elemResolver,
	}, nil
}
