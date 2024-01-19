package analysis

import "github.com/graphql-go/graphql/language/ast"

// ASTLookup must lookup types in the original schema.
type ASTLookup interface {
	LookupType(ast.Type) ast.TypeDefinition
}
