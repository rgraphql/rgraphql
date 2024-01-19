package types

import (
	"github.com/graphql-go/graphql/language/ast"
	proto "github.com/rgraphql/rgraphql"
)

var GraphQLPrimitivesKinds = map[string]string{
	"Int":     "SCALAR",
	"String":  "SCALAR",
	"Float":   "SCALAR",
	"Boolean": "SCALAR",
	"Object":  "OBJECT",
	"ID":      "SCALAR",
}

// GraphQLPrimitivesProtoKinds maps graphql primitive type names to proto primitive kinds.
var GraphQLPrimitivesProtoKinds = map[string]proto.RGQLPrimitive_Kind{
	"Int":     proto.RGQLPrimitive_PRIMITIVE_KIND_INT,
	"String":  proto.RGQLPrimitive_PRIMITIVE_KIND_STRING,
	"Float":   proto.RGQLPrimitive_PRIMITIVE_KIND_FLOAT,
	"Boolean": proto.RGQLPrimitive_PRIMITIVE_KIND_BOOL,
	"Object":  proto.RGQLPrimitive_PRIMITIVE_KIND_OBJECT,
	"ID":      proto.RGQLPrimitive_PRIMITIVE_KIND_STRING,
}

// IsPrimitive checks if the type name is a primitive.
func IsPrimitive(name string) bool {
	_, ok := GraphQLPrimitivesProtoKinds[name]
	return ok
}

// IsAstPrimitive checks if the ast type is a primitive.
func IsAstPrimitive(typ ast.Type) bool {
	if nn, ok := typ.(*ast.Named); ok {
		return nn.Name != nil && IsPrimitive(nn.Name.Value)
	}

	return false
}

// AstPrimitiveProtoKind returns the primitive kind for the AST type.
func AstPrimitiveProtoKind(typ ast.Type) (proto.RGQLPrimitive_Kind, bool) {
	if nn, ok := typ.(*ast.Named); ok {
		if nn.Name != nil {
			k, ok := GraphQLPrimitivesProtoKinds[nn.Name.Value]
			return k, ok
		}
	}
	return 0, false
}
