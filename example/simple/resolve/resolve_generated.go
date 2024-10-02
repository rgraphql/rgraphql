//go:build !rgraphql_analyze
// +build !rgraphql_analyze

package resolve

import (
	"context"

	"github.com/rgraphql/rgraphql/example/simple"
	"github.com/rgraphql/rgraphql/resolver"
)

func ResolvePerson(rctx *resolver.Context, r *simple.PersonResolver) {
	if r == nil {
		rctx.WriteValue(resolver.BuildNullValue(), true)
		return
	}
	fieldMap := map[uint32]resolver.FieldResolver{1579384326: func(rctx *resolver.Context) {
		v := r.Name()
		resolver.ResolveValue(rctx, true, func() *resolver.Value {
			return resolver.BuildStringValue(v)
		})
	}, 4115522831: func(rctx *resolver.Context) {
		v := r.Height()
		v1 := (int32)(v) //nolint:gosec
		resolver.ResolveValue(rctx, true, func() *resolver.Value {
			return resolver.BuildIntValue(v1)
		})
	}}
	resolver.ResolveObject(rctx, fieldMap)
}
func ResolveRootQuery(rctx *resolver.Context, r *simple.RootResolver) {
	if r == nil {
		rctx.WriteValue(resolver.BuildNullValue(), true)
		return
	}
	fieldMap := map[uint32]resolver.FieldResolver{3240268920: func(rctx *resolver.Context) {
		ctx := rctx.Context
		var vctx *resolver.Context
		outCh := make(chan int)
		go func() {
			r.GetCounter(ctx, outCh)
		}()
		for {
			select {
			case <-ctx.Done():
				return
			case v := <-outCh:
				if vctx != nil {
					vctx.Purge()
				}
				vctx = rctx.VirtualChild()
				rctx := vctx
				v1 := (int32)(v) //nolint:gosec
				resolver.ResolveValue(rctx, true, func() *resolver.Value {
					return resolver.BuildIntValue(v1)
				})
			}
		}
	}, 4063447360: func(rctx *resolver.Context) {
		ctx := rctx.Context
		outCh := make(chan string)
		errCh := make(chan error, 1)
		go func() {
			errCh <- r.Names(ctx, outCh)
		}()
		var ri uint32
		for {
			select {
			case <-ctx.Done():
				return
			case v := <-outCh:
				rctx := rctx.ArrayChild(ri)
				ri++
				resolver.ResolveValue(rctx, true, func() *resolver.Value {
					return resolver.BuildStringValue(v)
				})
			case err := <-errCh:
				resolver.ResolveError(rctx, err)
				return
			}
		}
	}, 4164672671: func(rctx *resolver.Context) {
		v := r.AllPeople()
		resolver.ResolveSlice(rctx, len(v), func(rctx *resolver.Context, i int) {
			v := v[i]
			go ResolvePerson(rctx, v)
		})
	}, 684475949: func(rctx *resolver.Context) {
		ctx := rctx.Context
		var vctx *resolver.Context
		outCh := make(chan *simple.PersonResolver)
		go func() {
			r.GetSinglePerson(ctx, outCh)
		}()
		for {
			select {
			case <-ctx.Done():
				return
			case v := <-outCh:
				if vctx != nil {
					vctx.Purge()
				}
				vctx = rctx.VirtualChild()
				rctx := vctx
				go ResolvePerson(rctx, v)
			}
		}
	}}
	resolver.ResolveObject(rctx, fieldMap)
}

var _ context.Context
