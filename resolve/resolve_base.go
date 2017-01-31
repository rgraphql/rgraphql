package resolve

import (
	"fmt"
	"reflect"

	"github.com/rgraphql/magellan/util"
)

type baseResolver struct {
	resolverFunc reflect.Method
}

// Find a resolver function for a field.
func findResolverFunc(resolverType reflect.Type, fieldName string) (*reflect.Method, error) {
	if resolverType.Kind() == reflect.Struct {
		resolverType = reflect.PtrTo(resolverType)
	}
	fieldNamePascal := util.ToPascalCase(fieldName)
	resolverFunc, ok := resolverType.MethodByName(fieldNamePascal)
	if !ok {
		return nil, fmt.Errorf(
			"Cannot find resolver for %s on %s - expected func %s.",
			fieldName, resolverType.String(), fieldNamePascal)
	}
	return &resolverFunc, nil
}
