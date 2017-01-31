package resolve

import (
	"github.com/graphql-go/graphql/language/ast"
)

type objectResolver struct {
	// Go type and GraphQL type
	pair TypeResolverPair
	// Object definition
	odef *ast.ObjectDefinition
	// Field resolvers
	fieldResolvers map[string]Resolver
}

// func (r *objectResolver) execute()

// Build resolvers for an object.
func (rt *ResolverTree) buildObjectResolver(pair TypeResolverPair, odef *ast.ObjectDefinition) (Resolver, error) {
	objr := &objectResolver{
		pair:           pair,
		odef:           odef,
		fieldResolvers: make(map[string]Resolver),
	}

	// Foreach field, expect a resolver function.
	for _, field := range odef.Fields {
		if field.Name == nil || field.Name.Value == "" {
			continue
		}

		resolverFunc, err := findResolverFunc(pair.ResolverType, field.Name.Value)
		if err != nil {
			return nil, err
		}

		// Build function executor.
		fieldResolver, err := rt.buildFuncResolver(resolverFunc, field.Type)
		if err != nil {
			return nil, err
		}
		objr.fieldResolvers[field.Name.Value] = fieldResolver
	}

	return objr, nil
}
