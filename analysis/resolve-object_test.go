package analysis

import (
	"testing"

	"github.com/rgraphql/rgraphql/schema"
)

const testResolveObject_Schema = `
type RootQuery {
	names: [String]
	age(name: String): Int
}

schema {
	query: RootQuery
}
`

const objectExpectedOut = `package test-output

func ResolveRootQuery(rctx *resolver.Context, r *example.RootResolver) {
	if r == nil {
		rctx.WriteValue(resolver.BuildNullValue(), true)
		return
	}
	fieldMap := map[string]resolver.FieldResolver{"age": func(rctx *resolver.Context) {
		rargs := &example.GetAgeArgs{}
		if argVar := rctx.GetQueryArgument("name"); argVar != nil {
			val := argVar.GetValue().GetStringValue()
			rargs.Name = val
		}
		v, err := r.GetAge(rargs)
		if err != nil {
			resolver.ResolveError(rctx, err)
			return
		}
		v1 := (int32)(v)
		resolver.ResolveValue(rctx, true, func() *resolver.Value {
			return resolver.BuildIntValue(v1)
		})
	}, "names": func(rctx *resolver.Context) {
		ctx := rctx.Context
		outCh := make(chan string)
		errCh := make(chan error, 1)
		go func() {
			errCh <- r.GetNames(ctx, outCh)
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
	}}
	resolver.ResolveObject(rctx, fieldMap)
}
`

// TestResolveObjectCodegen checks the Go output of the object resolver.
func TestResolveObjectCodegen(t *testing.T) {
	scm, err := schema.Parse(testResolveObject_Schema)
	if err != nil {
		t.Fatal(err.Error())
	}

	scope := parseCodeToScope(t)
	mb := newModelBuilder(scm.Definitions)
	rootResolver := scope.Lookup("RootResolver")
	res, err := mb.buildResolver(typeResolverPair{
		ASTType:      scm.Definitions.RootQuery,
		ResolverType: rootResolver.Type(),
	})
	if err != nil {
		t.Fatal(err.Error())
	}

	decls, err := res.GenerateGoASTDecls()
	if err != nil {
		t.Fatal(err.Error())
	}

	if len(decls) != 1 {
		t.Fatalf("expected 1 decl, got %d", len(decls))
	}

	testASTCodegenDecls(
		t,
		decls,
		objectExpectedOut,
	)
}
