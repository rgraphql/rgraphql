package analysis

import (
	gtypes "go/types"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/pkg/errors"
	"github.com/rgraphql/rgraphql/types"
)

// modelBuilder contains state while analyzing the AST.
type modelBuilder struct {
	lookup    ASTLookup
	resolvers map[typeResolverPair]Resolver
	imports   map[string]struct{}
}

// newModelBuilder builds a new model builder.
func newModelBuilder(lookup ASTLookup) *modelBuilder {
	return &modelBuilder{
		lookup:    lookup,
		resolvers: make(map[typeResolverPair]Resolver),
		imports:   make(map[string]struct{}),
	}
}

// buildResolver builds a resolver for a AST - Go resolver pair.
func (rt *modelBuilder) buildResolver(pair typeResolverPair) (resolver Resolver, err error) {
	if er, ok := rt.resolvers[pair]; ok {
		return er, nil
	}

	var ignoreResolver bool
	defer func() {
		if err == nil && resolver != nil && !ignoreResolver {
			rt.resolvers[pair] = resolver
		}
	}()

	switch gt := pair.ASTType.(type) {
	case *ast.Named:
		// Follow name pointer
		ignoreResolver = true
		return rt.buildFollowResolver(pair.ResolverType, gt)
	case *ast.NonNull:
		return rt.buildResolver(typeResolverPair{
			ASTType:      gt.Type,
			ResolverType: pair.ResolverType,
		})
	case *ast.ObjectDefinition:
		return rt.buildObjectResolver(pair, gt)
	case *ast.List:
		return rt.buildListResolver(pair, gt)
		/*
			case *ast.EnumDefinition:
				return rt.buildEnumResolver(pair.ResolverType, gt)
		*/
	default:
		return nil, errors.Errorf("unsupported kind %s", pair.ASTType.GetKind())
	}
}

// lookupType returns the type definition for a named type.
func (rt *modelBuilder) lookupType(gt ast.Type) (ast.TypeDefinition, error) {
	nextType := rt.lookup.LookupType(gt)
	if nextType == nil {
		if ntn, ok := gt.(*ast.Named); ok {
			return nil, errors.Errorf("cannot find type named %s", ntn.Name.Value)
		}

		return nil, errors.Errorf("cannot find type %#v", gt)
	}
	return nextType, nil
}

// buildFollowResolver follows a named pointer.
func (rt *modelBuilder) buildFollowResolver(atype gtypes.Type, typ ast.Type) (Resolver, error) {
	if types.IsAstPrimitive(typ) {
		return rt.buildPrimitiveResolver(atype, typ.(*ast.Named))
	}

	nextType, err := rt.lookupType(typ)
	if err != nil {
		return nil, err
	}
	return rt.buildResolver(typeResolverPair{
		ASTType:      nextType,
		ResolverType: atype,
	})
}
