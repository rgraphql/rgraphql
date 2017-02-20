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
	ptrDepth  int
	convertTo reflect.Type
}

func (pr *primitiveResolver) Execute(rc *resolutionContext, resolver reflect.Value) {
	for i := 0; i < pr.ptrDepth; i++ {
		if resolver.IsNil() {
			break
		}
		resolver = resolver.Elem()
	}
	if pr.convertTo != nil {
		resolver = resolver.Convert(pr.convertTo)
	}
	rc.SetValue(resolver.Interface())
}

func (rt *ResolverTree) buildPrimitiveResolver(value reflect.Type, gtyp *ast.Named) (Resolver, error) {
	// Check if we have a channel.
	// We can nest channels (<-chan <-chan <-chan <-chan string for example) as much as we want.
	// The system will create a value tree leaf for each level, and communicate changes to the client.
	if value.Kind() == reflect.Chan {
		return rt.buildChanValueResolver(value, gtyp)
	}

	// Check primitives match
	expectedKind, ok := types.GraphQLPrimitives[gtyp.Name.Value]
	if !ok {
		return nil, errors.New("Not a primitive.")
	}

	expectedType, ok := types.GraphQLPrimitivesTypes[gtyp.Name.Value]
	if !ok {
		return nil, errors.New("Not a primitive with a Go type.")
	}

	vkind := value.Kind()
	ptrDepth := 0
	for vkind == reflect.Ptr {
		ptrDepth++
		vkind = value.Elem().Kind()
	}
	var convertTo reflect.Type
	if expectedKind != vkind {
		if value.ConvertibleTo(expectedType) {
			convertTo = expectedType
		} else {
			return nil, fmt.Errorf("Expected %v, got %v.", expectedKind, vkind)
		}
	}
	return &primitiveResolver{
		ptrDepth:  ptrDepth,
		convertTo: convertTo,
	}, nil
}
