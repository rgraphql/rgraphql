package resolve

import (
	"errors"
	"fmt"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
)

// Source this from somewhere else...
var GraphQLPrimitives = map[string]reflect.Kind{
	"Int":     reflect.Int,
	"String":  reflect.String,
	"Float":   reflect.Float32,
	"Boolean": reflect.Bool,
	// ID?
}

// primitiveResolver is the final step once we reach a primitive.
// It is responsible for actually transmitting base values.
type primitiveResolver struct {
	isPtr bool
}

func isPrimitive(name string) bool {
	for prim := range GraphQLPrimitives {
		if prim == name {
			return true
		}
	}
	return false
}

func isAstPrimtive(typ ast.Type) bool {
	if nn, ok := typ.(*ast.Named); ok {
		return nn.Name != nil && isPrimitive(nn.Name.Value)
	}
	return false
}

func (rt *ResolverTree) buildPrimitiveResolver(value reflect.Type, gtyp *ast.Named) (Resolver, error) {
	// Check primitives match
	expectedKind, ok := GraphQLPrimitives[gtyp.Name.Value]
	if !ok {
		return nil, errors.New("Not a primitive.")
	}
	vkind := value.Kind()
	isPtr := vkind == reflect.Ptr
	if isPtr {
		vkind = value.Elem().Kind()
	}
	if expectedKind != vkind {
		return nil, fmt.Errorf("Expected %v, got %v.", expectedKind, vkind)
	}
	return &primitiveResolver{
		isPtr: isPtr,
	}, nil
}
