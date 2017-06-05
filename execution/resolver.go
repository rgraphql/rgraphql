package execution

import (
	"fmt"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/types"
)

// A Resolver resolves one field or component of a field.
type Resolver interface {
	Execute(ctx *ResolverContext, parentValue reflect.Value)
}

// typeResolverPair represents a graphql type and its Go resolver.
type typeResolverPair struct {
	Type         ast.Node
	ResolverType reflect.Type
}

// buildResolver builds a resolver for a pair.
func (mb *modelBuilder) buildResolver(pair typeResolverPair) (resolver Resolver, err error) {
	if er, ok := mb.Resolvers[pair]; ok {
		return er, nil
	}

	defer func() {
		if err == nil && resolver != nil {
			mb.Resolvers[pair] = resolver
		}
	}()

	switch gt := pair.Type.(type) {
	case *ast.Named:
		// Follow name pointer
		return mb.buildFollowResolver(pair.ResolverType, gt)
	case *ast.NonNull:
		return mb.buildResolver(typeResolverPair{
			Type:         gt.Type,
			ResolverType: pair.ResolverType,
		})
	case *ast.List:
		return mb.buildListResolver(pair, gt)
	case *ast.ObjectDefinition:
		return mb.buildObjectResolver(pair, gt)
	case *ast.EnumDefinition:
		return mb.buildEnumResolver(pair.ResolverType, gt)
	default:
		return nil, fmt.Errorf("Unsupported kind %s", pair.Type.GetKind())
	}
}

// lookupType returns the type definition for a named type.
func (mb *modelBuilder) lookupType(gt ast.Type) (ast.TypeDefinition, error) {
	nextType := mb.Lookup.LookupType(gt)
	if nextType == nil {
		if ntn, ok := gt.(*ast.Named); ok {
			return nil, fmt.Errorf("Cannot find type named %s.", ntn.Name.Value)
		}
		return nil, fmt.Errorf("Cannot find type %#v.", gt)
	}
	return nextType, nil
}

// buildFollowResolver follows a named pointer.
func (mb *modelBuilder) buildFollowResolver(resolver reflect.Type, typ ast.Type) (Resolver, error) {
	if types.IsAstPrimitive(typ) {
		return mb.buildPrimitiveResolver(resolver, typ.(*ast.Named))
	}

	nextType, err := mb.lookupType(typ)
	if err != nil {
		return nil, err
	}
	return mb.buildResolver(typeResolverPair{
		Type:         nextType,
		ResolverType: resolver,
	})
}
