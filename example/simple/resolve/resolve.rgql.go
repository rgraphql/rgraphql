//go:build !rgraphql_analyze
// +build !rgraphql_analyze

package resolve

import (
	"math"

	"github.com/rgraphql/rgraphql/example/simple"
	"github.com/rgraphql/rgraphql/resolver"
)

func ResolvePerson(rctx *resolver.Context, r *simple.PersonResolver) {
	if r == nil {
		rctx.WriteValue(resolver.BuildNullValue(), true)
		return
	}
	resolver.ResolveObject(rctx, func(fieldName string) resolver.FieldResolver {
		var fieldResolver resolver.FieldResolver
		switch fieldName {
		case "height":
			fieldResolver = func(rctx *resolver.Context) {
				v := r.Height()
				if v > math.MaxInt32 || v < math.MinInt32 {
					resolver.ResolveValOverflowError(rctx)
					return
				}
				v1 := (int32)(v)
				resolver.ResolveValue(rctx, true, func() *resolver.Value {
					return resolver.BuildIntValue(v1)
				})
			}
		case "name":
			fieldResolver = func(rctx *resolver.Context) {
				v := r.Name()
				resolver.ResolveValue(rctx, true, func() *resolver.Value {
					return resolver.BuildStringValue(v)
				})
			}
		}
		return fieldResolver
	})
}
func ResolveRootQuery(rctx *resolver.Context, r *simple.RootResolver) {
	if r == nil {
		rctx.WriteValue(resolver.BuildNullValue(), true)
		return
	}
	resolver.ResolveObject(rctx, func(fieldName string) resolver.FieldResolver {
		var fieldResolver resolver.FieldResolver
		switch fieldName {
		case "allPeople":
			fieldResolver = func(rctx *resolver.Context) {
				v := r.AllPeople()
				resolver.ResolveSlice(rctx, len(v), func(rctx *resolver.Context, i int) {
					v := v[i]
					go ResolvePerson(rctx, v)
				})
			}
		case "counter":
			fieldResolver = func(rctx *resolver.Context) {
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
						if v > math.MaxInt32 || v < math.MinInt32 {
							resolver.ResolveValOverflowError(rctx)
							return
						}
						v1 := (int32)(v)
						resolver.ResolveValue(rctx, true, func() *resolver.Value {
							return resolver.BuildIntValue(v1)
						})
					}
				}
			}
		case "names":
			fieldResolver = func(rctx *resolver.Context) {
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
			}
		case "singlePerson":
			fieldResolver = func(rctx *resolver.Context) {
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
			}
		}
		return fieldResolver
	})
}
