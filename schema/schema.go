package schema

import (
	"errors"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/graphql-go/graphql/language/parser"
	"github.com/rgraphql/magellan/execution"
	"github.com/rgraphql/magellan/introspect"
	"github.com/rgraphql/magellan/qtree"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

var defaultCacheSize uint32 = 100

// Schema is a combination of a parsed AST Schema and a resolver tree.
type Schema struct {
	Document       *ast.Document
	Definitions    *ASTParts
	SchemaResolver *introspect.SchemaResolver

	QueryModel    *execution.Model
	MutationModel *execution.Model
	CacheSize     uint32
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
		CacheSize:      defaultCacheSize,
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

		model, err := execution.BuildModel(rootQueryObj, s.Definitions, s.SchemaResolver, rootQueryResolver, false)
		if err != nil {
			return err
		}
		s.QueryModel = model
	}

	if rootMutationResolver != nil {
		rootMutationObj, ok := s.Definitions.RootMutation.(*ast.ObjectDefinition)
		if !ok || rootMutationObj.Name == nil {
			return errors.New("Root mutation schema not defined, or not an object.")
		}

		model, err := execution.BuildModel(rootMutationObj, s.Definitions, s.SchemaResolver, rootMutationResolver, true)
		if err != nil {
			return err
		}

		s.MutationModel = model
	}
	return nil
}

// HasQueryResolvers checks if the Schema has query resolvers applied.
func (s *Schema) HasQueryResolvers() bool {
	return s.QueryModel != nil
}

// HasMutationResolvers checks if the Schema has mutation resolvers applied.
func (s *Schema) HasMutationResolvers() bool {
	return s.MutationModel != nil
}

// BuildQueryTree builds a new query tree from this schema.
func (s *Schema) BuildQueryTree(sendCh chan<- *proto.RGQLQueryError, operationKind string) (*qtree.QueryTreeNode, error) {
	var rootObj *ast.ObjectDefinition
	if s.Definitions == nil {
		return nil, errors.New("Schema not parsed yet.")
	}
	isMutation := operationKind == "mutation"
	if !isMutation && operationKind != "query" {
		return nil, errors.New("Only query and mutation operations are supported.")
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
