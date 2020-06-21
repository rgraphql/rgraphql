package schema

import (
	"errors"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/graphql-go/graphql/language/parser"
	"github.com/rgraphql/magellan/introspect"
	"github.com/rgraphql/magellan/qtree"
	proto "github.com/rgraphql/rgraphql"
)

var defaultCacheSize uint32 = 100

// Schema is a combination of a parsed AST Schema and a resolver tree.
type Schema struct {
	Document       *ast.Document
	Definitions    *ASTParts
	SchemaResolver *introspect.SchemaResolver

	// QueryResolver    *execution.Model
	// MutationModel *execution.Model
	CacheSize uint32
}

// FromDocument makes a Schema from an AST document.
func FromDocument(doc *ast.Document) *Schema {
	// Transform all named pointers -> actual pointers.
	definitions := DocumentToParts(doc)
	definitions.ApplyIntrospection()
	schemaResolver := &introspect.SchemaResolver{
		Lookup:     definitions,
		NamedTypes: definitions.Types,
		RootQuery:  definitions.RootQuery,
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

// BuildQueryTree builds a new query tree from this schema.
func (s *Schema) BuildQueryTree(sendCh chan<- *proto.RGQLQueryError) (*qtree.QueryTreeNode, error) {
	if s.Definitions == nil {
		return nil, errors.New("schema not parsed")
	}
	if s.Definitions.RootQuery == nil {
		return nil, errors.New("root query object not found")
	}
	return qtree.NewQueryTree(
		s.Definitions.RootQuery,
		s.Definitions,
		sendCh,
	), nil
}
