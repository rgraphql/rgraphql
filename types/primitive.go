package types

import (
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
)

var GraphQLPrimitives = map[string]reflect.Kind{
	"Int":     reflect.Int,
	"String":  reflect.String,
	"Float":   reflect.Float32,
	"Boolean": reflect.Bool,
	"Object":  reflect.Map,
	"ID":      reflect.String,
}

var GraphQLPrimitivesKinds = map[string]string{
	"Int":     "SCALAR",
	"String":  "SCALAR",
	"Float":   "SCALAR",
	"Boolean": "SCALAR",
	"Object":  "OBJECT",
	"ID":      "SCALAR",
}

var GraphQLPrimitivesTypes = map[string]reflect.Type{
	"Int":     reflect.TypeOf(0),
	"String":  reflect.TypeOf(""),
	"Float":   reflect.TypeOf(float32(0)),
	"Boolean": reflect.TypeOf(true),
	"Object":  reflect.TypeOf(make(map[string]interface{})),
	"ID":      reflect.TypeOf(""),
}

type GraphQLPrimitiveScalar struct {
	*ast.ScalarDefinition
	TypeKind string
	Kind     reflect.Kind
}

var GraphQLPrimitivesAST map[string]ast.TypeDefinition

func init() {
	GraphQLPrimitivesAST = make(map[string]ast.TypeDefinition)
	for name, kind := range GraphQLPrimitives {
		GraphQLPrimitivesAST[name] = &GraphQLPrimitiveScalar{
			ScalarDefinition: &ast.ScalarDefinition{
				Kind: "ScalarDefinition",
				Name: &ast.Name{
					Kind:  "Name",
					Value: name,
				},
			},
			Kind:     kind,
			TypeKind: GraphQLPrimitivesKinds[name],
		}
	}
}

func IsPrimitive(name string) bool {
	_, ok := GraphQLPrimitives[name]
	return ok
}

func IsAstPrimitive(typ ast.Type) bool {
	if nn, ok := typ.(*ast.Named); ok {
		return nn.Name != nil && IsPrimitive(nn.Name.Value)
	}
	return false
}

func AstPrimitiveKind(typ ast.Type) (reflect.Kind, bool) {
	if nn, ok := typ.(*ast.Named); ok {
		if nn.Name != nil {
			k, ok := GraphQLPrimitives[nn.Name.Value]
			return k, ok
		}
	}
	return reflect.Kind(0), false
}
