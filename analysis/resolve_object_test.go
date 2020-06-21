package analysis

import (
	"testing"

	"github.com/rgraphql/magellan/schema"
)

const testResolveObject_ResolverCode = `
import "context"

type RootResolver struct {}

// GetNames returns the names of the people.
func (r *RootResolver) GetNames(ctx context.Context, outCh chan<- string) error {
	outCh <- "test1"
	outCh <- "test2"
	return nil
}

type GetAgeArgs struct {
	Name string
}

// GetAge returns the age of the person by name.
func (r *RootResolver) GetAge(args *GetAgeArgs) (int, error) {
	_ = args.Name
	return 22, nil
}
`
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

func ResolveRootQuery(rctx *resolver.Context, r *RootQuery) {
	if r == nil {
		rctx.WriteValue(resolver.BuildNullValue(), true)
		return
	}
	fieldMap := map[uint32]resolver.FieldResolver{4063447360: func(rctx *resolver.Context) {
		ctx := rctx.Context
		outCh := make(chan string)
		errCh := make(chan error, 1)
		go func() {
			errCh <- r.GetNames(ctx, outCh)
		}()
		var ri int
		for {
			select {
			case <-ctx.Done():
				return
			case err := <-errCh:
				resolver.ResolveError(rctx, err)
				return
			case v := <-outCh:
				rctx := rctx.ArrayChild(ri)
				ri++
				resolver.ResolveValue(rctx, true, func() *resolver.Value {
					return resolver.BuildStringValue(v)
				})
			}
		}
	}, 2704281778: func(rctx *resolver.Context) {
		v, err := r.GetAge(rargs)
		if err != nil {
			resolver.ResolveError(rctx, err)
			return
		}
		v1 := (int32)(v)
		resolver.ResolveValue(rctx, true, func() *resolver.Value {
			return resolver.BuildIntValue(v1)
		})
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

	scope := parseCodeToScope(t, testResolveObject_ResolverCode)

	mb := newModelBuilder(scm.Definitions)
	res, err := mb.buildResolver(typeResolverPair{
		ASTType:      scm.Definitions.RootQuery,
		ResolverType: scope.Lookup("RootResolver").Type(),
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
