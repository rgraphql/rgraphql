package analysis

import (
	"bytes"
	"go/ast"
	"go/printer"
	"go/token"
	"testing"
)

// testASTCodegen tests a []ast.Stmt set against an expected output.
func testASTCodegen(t *testing.T, stmts []ast.Stmt, expected string) {
	testASTCodegenDecls(
		t,
		[]ast.Decl{
			&ast.FuncDecl{
				Name: ast.NewIdent("resolve"),
				Type: &ast.FuncType{
					Func: token.NoPos,
				},
				Body: &ast.BlockStmt{
					List: stmts,
				},
			},
		},
		expected,
	)
}

// testASTCodegenDecls tests a []ast.Decl set against an expected output.
func testASTCodegenDecls(t *testing.T, decls []ast.Decl, expected string) {
	var outBuf bytes.Buffer
	f := &ast.File{
		Name:  ast.NewIdent("test-output"),
		Decls: decls,
	}
	fset := token.NewFileSet()
	if err := printer.Fprint(&outBuf, fset, f); err != nil {
		t.Fatal(err.Error())
	}

	outputStr := outBuf.String()
	t.Logf("%s", outBuf.String())
	if expected != outputStr {
		t.Logf("expected\n%s", expected)
		t.Fatal("code generation incorrect")
	}
}
