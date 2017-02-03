package resolve

import (
	// "context"
	"fmt"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/types"
)

type Resolver interface {
	// execute(ctx context.Context)
}

type TypeResolverPair struct {
	GqlType      ast.Node
	ResolverType reflect.Type
}

type ASTLookup interface {
	LookupType(ast.Type) ast.TypeDefinition
}

type ResolverMap map[TypeResolverPair]Resolver

type ResolverTree struct {
	Resolvers ResolverMap
	Lookup    ASTLookup
}

func NewResolverTree(lookup ASTLookup) *ResolverTree {
	return &ResolverTree{
		Resolvers: make(ResolverMap),
		Lookup:    lookup,
	}
}

func (rt *ResolverTree) lookupType(gt ast.Type) (ast.TypeDefinition, error) {
	nextType := rt.Lookup.LookupType(gt)
	if nextType == nil {
		if ntn, ok := gt.(*ast.Named); ok {
			return nil, fmt.Errorf("Cannot find type named %s.", ntn.Name.Value)
		}
		return nil, fmt.Errorf("Cannot find type %#v.", gt)
	}
	return nextType, nil
}

// Follow a named pointer.
func (rt *ResolverTree) buildFollowResolver(resolver reflect.Type, typ ast.Type) (Resolver, error) {
	if types.IsAstPrimtive(typ) {
		// isAstPrimitive asserts ast.Named
		return rt.buildPrimitiveResolver(resolver, typ.(*ast.Named))
	}

	nextType, err := rt.lookupType(typ)
	if err != nil {
		return nil, err
	}
	return rt.BuildResolver(TypeResolverPair{
		GqlType:      nextType,
		ResolverType: resolver,
	})
}

func (rt *ResolverTree) BuildResolver(pair TypeResolverPair) (resolver Resolver, err error) {
	if er, ok := rt.Resolvers[pair]; ok {
		return er, nil
	}

	defer func() {
		if err == nil && resolver != nil {
			rt.Resolvers[pair] = resolver
		}
	}()

	switch gt := pair.GqlType.(type) {
	case *ast.Named:
		// Follow name pointer
		return rt.buildFollowResolver(pair.ResolverType, gt)
	case *ast.List:
		return rt.buildListResolver(pair, gt)
	case *ast.ObjectDefinition:
		return rt.buildObjectResolver(pair, gt)
	default:
		return nil, fmt.Errorf("Unsupported kind %s", pair.GqlType.GetKind())
	}
}
