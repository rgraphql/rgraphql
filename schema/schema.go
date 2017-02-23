package schema

import (
	"context"
	"errors"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/graphql-go/graphql/language/parser"
	"github.com/rgraphql/magellan/introspect"
	"github.com/rgraphql/magellan/qtree"
	"github.com/rgraphql/magellan/resolve"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

// Schema is a combination of a parsed AST Schema and a resolver tree.
type Schema struct {
	Document       *ast.Document
	Definitions    *ASTParts
	SchemaResolver *introspect.SchemaResolver

	QueryResolver     resolve.Resolver
	RootQueryResolver reflect.Value

	MutationResolver     resolve.Resolver
	RootMutationResolver reflect.Value
}

// FromDocument makes a Schema from an AST document.
func FromDocument(doc *ast.Document) *Schema {
	// Transform all named pointers -> actual pointers.
	definitions := DocumentToParts(doc)
	definitions.ApplyIntrospection()
	schemaResolver := &introspect.SchemaResolver{
		Lookup:           definitions,
		NamedTypes:       definitions.Types,
		RootMutation:     definitions.RootMutation,
		RootQuery:        definitions.RootQuery,
		RootSubscription: definitions.RootSubscription,
	}
	return &Schema{
		Document:       doc,
		Definitions:    definitions,
		SchemaResolver: schemaResolver,
	}
}

// Parse a AST document given a docStr GraphQL schema string.
func Parse(docStr string) (*Schema, error) {
	doc, err := parser.Parse(
		parser.ParseParams{
			Source: docStr,
			Options: parser.ParseOptions{
				NoLocation: true,
				NoSource:   true,
			},
		},
	)
	if err != nil {
		return nil, err
	}
	return FromDocument(doc), nil
}

// SetResolvers applies a prototype resolver instance to the tree.
func (s *Schema) SetResolvers(rootQueryResolver interface{},
	rootMutationResolver interface{}) error {
	if s.Definitions == nil {
		return errors.New("Definitions have not been parsed yet.")
	}
	if len(s.Definitions.Schemas) == 0 {
		return errors.New("No schema block given in schema AST.")
	}

	if rootQueryResolver != nil {
		rootQueryObj, ok := s.Definitions.RootQuery.(*ast.ObjectDefinition)
		if !ok || rootQueryObj.Name == nil {
			return errors.New("Root query schema not defined, or not an object.")
		}

		rootQueryResolverType := reflect.TypeOf(rootQueryResolver)
		rootQueryPair := resolve.TypeResolverPair{GqlType: rootQueryObj, ResolverType: rootQueryResolverType}

		rt := resolve.NewResolverTree(s.Definitions, s.SchemaResolver, false)
		rr, err := rt.BuildResolver(rootQueryPair)
		if err != nil {
			return err
		}

		s.QueryResolver = rr
		s.RootQueryResolver = reflect.ValueOf(rootQueryResolver)
	}

	if rootMutationResolver != nil {
		rootMutationObj, ok := s.Definitions.RootMutation.(*ast.ObjectDefinition)
		if !ok || rootMutationObj.Name == nil {
			return errors.New("Root mutation schema not defined, or not an object.")
		}

		rootMutationResolverType := reflect.TypeOf(rootMutationResolver)
		rootMutationPair := resolve.TypeResolverPair{
			GqlType:      rootMutationObj,
			ResolverType: rootMutationResolverType,
		}

		rt := resolve.NewResolverTree(s.Definitions,
			s.SchemaResolver,
			true)
		rr, err := rt.BuildResolver(rootMutationPair)
		if err != nil {
			return err
		}

		s.MutationResolver = rr
		s.RootMutationResolver = reflect.ValueOf(rootMutationResolver)
	}
	return nil
}

// HasQueryResolvers checks if the Schema has query resolvers applied.
func (s *Schema) HasQueryResolvers() bool {
	return s.QueryResolver != nil && s.RootQueryResolver.IsValid() && !s.RootQueryResolver.IsNil()
}

// HasMutationResolvers checks if the Schema has mutation resolvers applied.
func (s *Schema) HasMutationResolvers() bool {
	return s.MutationResolver != nil && s.RootMutationResolver.IsValid() && !s.RootMutationResolver.IsNil()
}

// QueryExecution is a handle on an execution instance of a query tree.
type QueryExecution interface {
	// Return the message channel (singleton).
	Messages() <-chan *proto.RGQLServerMessage
	// Wait for all resolvers to finish executing.
	Wait() (map[string]interface{}, error)
	// Cancel the query execution.
	Cancel()
}

// StartQuery creates a new QueryExecution handle and begins executing a query.
func (s *Schema) StartQuery(ctx context.Context, query *qtree.QueryTreeNode, isSerial bool) QueryExecution {
	return resolve.StartQuery(s.QueryResolver, ctx, s.RootQueryResolver, query, isSerial)
}

// StartMutation creates a new QueryExecution handle and begins executing a mutation.
func (s *Schema) StartMutation(ctx context.Context, query *qtree.QueryTreeNode) QueryExecution {
	return resolve.StartQuery(s.MutationResolver, ctx, s.RootMutationResolver, query, true)
}

// BuildQueryTree builds a new query tree from this schema.
func (s *Schema) BuildQueryTree(sendCh chan<- *proto.RGQLQueryError, isMutation bool) (*qtree.QueryTreeNode, error) {
	var rootObj *ast.ObjectDefinition
	if s.Definitions == nil {
		return nil, errors.New("Schema not parsed yet.")
	}
	if isMutation {
		if s.Definitions.RootMutation == nil {
			return nil, errors.New("Root mutation object not found.")
		}
		rootObj = s.Definitions.RootMutation.(*ast.ObjectDefinition)
	} else {
		if s.Definitions.RootQuery == nil {
			return nil, errors.New("Root query object not found.")
		}
		rootObj = s.Definitions.RootQuery.(*ast.ObjectDefinition)
	}
	return qtree.NewQueryTree(
		rootObj,
		s.Definitions,
		sendCh,
	), nil
}
