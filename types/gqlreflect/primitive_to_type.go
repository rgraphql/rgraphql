package gqlreflect

import (
	"reflect"
)

// GraphQLPrimitivesTypes maps the GraphQL primitives to reflect types.
var GraphQLPrimitivesTypes = map[string]reflect.Type{
	"Int":     reflect.TypeOf(0),
	"String":  reflect.TypeOf(""),
	"Float":   reflect.TypeOf(float32(0)),
	"Boolean": reflect.TypeOf(true),
	"Object":  reflect.TypeOf(make(map[string]interface{})),
	"ID":      reflect.TypeOf(""),
}

// GraphQLPrimitivesKinds maps the GraphQL primitives to reflect kinds.
var GraphQLPrimitivesKinds = map[string]reflect.Kind{
	"Int":     reflect.Int,
	"String":  reflect.String,
	"Float":   reflect.Float32,
	"Boolean": reflect.Bool,
	"Object":  reflect.Map,
	"ID":      reflect.String,
}
