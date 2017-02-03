package qtree

import (
	"github.com/graphql-go/graphql/language/ast"
)

type SchemaResolver interface {
	LookupType(ast.Type) ast.TypeDefinition
}
