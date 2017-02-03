package resolve

import (
	"errors"
	"fmt"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/types"
)

// primitiveResolver is the final step once we reach a primitive.
// It is responsible for actually transmitting base values.
type primitiveResolver struct {
	isPtr bool
}

func (rt *ResolverTree) buildPrimitiveResolver(value reflect.Type, gtyp *ast.Named) (Resolver, error) {
	// Check primitives match
	expectedKind, ok := types.GraphQLPrimitives[gtyp.Name.Value]
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
