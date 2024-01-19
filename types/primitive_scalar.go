package types

import (
	"github.com/graphql-go/graphql/language/ast"
)

// GraphQLPrimitiveScalar defines a scalar type for each built-in primitive.
type GraphQLPrimitiveScalar struct {
	*ast.ScalarDefinition
	TypeKind string
}

// GraphQLPrimitivesAST maps named primitive types to scalar definitions.
var GraphQLPrimitivesAST map[string]ast.TypeDefinition

func init() {
	GraphQLPrimitivesAST = make(map[string]ast.TypeDefinition)
	for name, kind := range GraphQLPrimitivesKinds {
		if kind != "SCALAR" {
			continue
		}

		GraphQLPrimitivesAST[name] = &GraphQLPrimitiveScalar{
			ScalarDefinition: &ast.ScalarDefinition{
				Kind: "ScalarDefinition",
				Name: &ast.Name{
					Kind:  "Name",
					Value: name,
				},
			},
			TypeKind: GraphQLPrimitivesKinds[name],
		}
	}
}
