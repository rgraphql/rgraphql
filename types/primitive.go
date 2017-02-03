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
	// ID?
}

func IsPrimitive(name string) bool {
	for prim := range GraphQLPrimitives {
		if prim == name {
			return true
		}
	}
	return false
}

func IsAstPrimtive(typ ast.Type) bool {
	if nn, ok := typ.(*ast.Named); ok {
		return nn.Name != nil && IsPrimitive(nn.Name.Value)
	}
	return false
}
