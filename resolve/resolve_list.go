package resolve

import (
	"fmt"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
)

type listResolver struct {
	elemResolver Resolver
}

type chanListResolver struct {
	*listResolver
}

func (rt *ResolverTree) buildListResolver(pair TypeResolverPair, ldef *ast.List) (Resolver, error) {
	isChan := pair.ResolverType.Kind() == reflect.Chan
	if isChan {
		if pair.ResolverType.ChanDir() != reflect.RecvDir {
			return nil, fmt.Errorf("Invalid array type %s, (should be a <-chan.)", pair.ResolverType.String())
		}
	} else {
		if pair.ResolverType.Kind() != reflect.Slice {
			return nil, fmt.Errorf("Expected array type, got %v (should be a slice or a chan).", pair.ResolverType.String())
		}
	}

	// The type in the pair will be a []*ResolverType or []ResolverType or <-chan ResolverType etc...
	arrElem := pair.ResolverType.Elem()
	if arrElem.Kind() == reflect.Ptr {
		arrElem = arrElem.Elem()
	}

	// Follow list element
	elemResolver, err := rt.buildFollowResolver(arrElem, ldef.Type)
	if err != nil {
		return nil, err
	}

	res := &listResolver{
		elemResolver: elemResolver,
	}

	if isChan {
		cres := &chanListResolver{
			listResolver: res,
		}

		return cres, nil
	}

	return res, nil
}
