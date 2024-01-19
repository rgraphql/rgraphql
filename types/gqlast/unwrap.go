package gqlast

import "github.com/graphql-go/graphql/language/ast"

// UnwrapASTType unwraps a list, required, or other wrapper type.
func UnwrapASTType(typ ast.Type) ast.Type {
	switch ut := typ.(type) {
	case *ast.List:
		return UnwrapASTType(ut.Type)
	case *ast.NonNull:
		return UnwrapASTType(ut.Type)
	default:
		return ut
	}
}
