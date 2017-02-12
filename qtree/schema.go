package qtree

import (
	"github.com/graphql-go/graphql/language/ast"
)

// SchemaResolver is a object that can lookup AST types.
type SchemaResolver interface {
	LookupType(ast.Type) ast.TypeDefinition
}

// typeNameDef is a reference variable for __typename, applied to all objects.
var typeNameDef *ast.FieldDefinition = &ast.FieldDefinition{
	Kind: "FieldDefinition",
	Name: &ast.Name{Kind: "Name", Value: "__typename"},
	Type: &ast.Named{Kind: "Named", Name: &ast.Name{Kind: "Name", Value: "String"}},
}
