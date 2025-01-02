package analysis

import (
	"go/token"
	gtypes "go/types"
	"os"
	"path"
	"testing"

	"github.com/graphql-go/graphql/language/ast"
	proto "github.com/rgraphql/rgraphql"
	"github.com/rgraphql/rgraphql/schema"
	"github.com/sirupsen/logrus"
	"golang.org/x/tools/go/packages"
)

const primBoolExpectedOut = `package test-output

func resolve() {
	resolver.ResolveValue(rctx, true, func() *resolver.Value {
		return resolver.BuildBoolValue(v)
	})
}
`

// TestResolvePrimitiveCodegen checks the Go output of the primitive resolver.
func TestResolvePrimitiveCodegen(t *testing.T) {
	rprim := &primitiveResolver{
		// ptrDepth: 0,
		// convertTo: nil,
		primKind: proto.RGQLPrimitive_PRIMITIVE_KIND_BOOL,
	}

	stmts, err := rprim.GenerateGoASTRef()
	if err != nil {
		t.Fatal(err.Error())
	}

	if len(stmts) != 1 {
		t.Fatalf("expected 1 stmt, got %d", len(stmts))
	}

	testASTCodegen(
		t,
		stmts,
		primBoolExpectedOut,
	)
}

const primIntPtrDerefExpectedOut = `package test-output

func resolve() {
	if v == nil {
		return resolver.BuildNullValue()
	}
	v1 := *v
	if v1 == nil {
		return resolver.BuildNullValue()
	}
	v2 := *v1
	if v2 == nil {
		return resolver.BuildNullValue()
	}
	v3 := *v2
	resolver.ResolveValue(rctx, true, func() *resolver.Value {
		return resolver.BuildIntValue(v3)
	})
}
`

// TestResolvePrimitiveCodegen_PtrDeref checks the Go output of the primitive resolver.
// Multiple variable dereferences are requested.
func TestResolvePrimitiveCodegen_PtrDeref(t *testing.T) {
	rprim := &primitiveResolver{
		ptrDepth: 3,
		// convertTo: nil,
		primKind: proto.RGQLPrimitive_PRIMITIVE_KIND_INT,
	}

	stmts, err := rprim.GenerateGoASTRef()
	if err != nil {
		t.Fatal(err.Error())
	}

	if len(stmts) != 7 {
		t.Fatalf("expected 7 stmt, got %d", len(stmts))
	}

	testASTCodegen(
		t,
		stmts,
		primIntPtrDerefExpectedOut,
	)
}

const testPrimitive_RootQueryResolver_Schema = `
type RootQuery {
	name: String
}

schema {
	query: RootQuery
}
`

// TestPrimitive_RootQueryResolver is a root query resolver for the primitive test.
type TestPrimitive_RootQueryResolver struct{}

// Name returns a simple string value.
func (r *TestPrimitive_RootQueryResolver) Name() string {
	return "TestName"
}

// TestBuildSimplePrimitiveResolverModel tests building a simple primitive resolver.
/* TODO: implement func resolver, object resolver AST generation
func TestBuildSimplePrimitiveResolverModel(t *testing.T) {
	scm, err := schema.Parse(testPrimitive_RootQueryResolver_Schema)
	if err != nil {
		t.Fatal(err.Error())
	}

	rootResolver := &TestPrimitive_RootQueryResolver{}
	model, err := BuildModel(
		scm.Definitions.RootQuery.(*ast.ObjectDefinition),
		scm.Definitions,
		rootResolver,
	)
	if err != nil {
		t.Fatal(err.Error())
	}

	_ = model
}
*/

const simplePrimResolverExpectedOut = `package test-output

func resolve() {
	if v == nil {
		return resolver.BuildNullValue()
	}
	v1 := *v
	resolver.ResolveValue(rctx, true, func() *resolver.Value {
		return resolver.BuildStringValue(v1)
	})
}
`

func parseCodeToScope(t *testing.T) *gtypes.Scope {
	var conf packages.Config
	wd, _ := os.Getwd()
	conf.Dir = path.Join(wd, "e2e")
	conf.Logf = logrus.Debugf
	conf.Mode = packages.NeedTypes

	fset := token.NewFileSet()
	conf.Fset = fset

	pkgs, err := packages.Load(&conf, ".")
	if err != nil {
		t.Fatal(err.Error())
	}

	pkg := pkgs[0]
	return pkg.Types.Scope()
}

// TestBuildSimplePrimitiveResolver tests building a simple primitive resolver.
// It resolves the gql types from the parsed AST and the Go types from Go's type analyzer.
func TestBuildSimplePrimitiveResolver(t *testing.T) {
	scm, err := schema.Parse(testPrimitive_RootQueryResolver_Schema)
	if err != nil {
		t.Fatal(err.Error())
	}

	scope := parseCodeToScope(t)
	myString := scope.Lookup("MyString")

	rqDef := scm.Definitions.RootQuery
	mb := newModelBuilder(scm.Definitions)
	primRes, err := mb.buildPrimitiveResolver(
		myString.Type(),
		rqDef.Fields[0].Type.(*ast.Named),
	)
	if err != nil {
		t.Fatal(err.Error())
	}

	stmts, err := primRes.GenerateGoASTRef()
	if err != nil {
		t.Fatal(err.Error())
	}

	testASTCodegen(t, stmts, simplePrimResolverExpectedOut)
}
