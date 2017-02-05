package schema

import (
	"context"
	"errors"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/graphql-go/graphql/language/parser"
	"github.com/rgraphql/magellan/qtree"
	"github.com/rgraphql/magellan/resolve"
)

type Schema struct {
	Document    *ast.Document
	Definitions *ASTParts

	queryResolver resolve.Resolver
	rootResolver  reflect.Value
}

func FromDocument(doc *ast.Document) *Schema {
	// Transform all named pointers -> actual pointers.
	definitions := DocumentToParts(doc)
	return &Schema{
		Document:    doc,
		Definitions: definitions,
	}
}

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

func (s *Schema) SetResolvers(rootQueryResolver interface{}) error {
	if s.Definitions == nil {
		return errors.New("Definitions have not been parsed yet.")
	}
	if len(s.Definitions.Schemas) == 0 {
		return errors.New("No schema block given in schema AST.")
	}
	queryOp, ok := s.Definitions.SchemaOperations["query"]
	if !ok || queryOp.Type == nil || queryOp.Type.Name == nil {
		return errors.New("Root query schema not defined.")
	}
	rootQueryObj, ok := s.Definitions.Objects[queryOp.Type.Name.Value]
	if !ok {
		return errors.New("Query type named by schema block not found.")
	}

	rootQueryResolverType := reflect.TypeOf(rootQueryResolver)
	rootPair := resolve.TypeResolverPair{GqlType: rootQueryObj, ResolverType: rootQueryResolverType}

	rt := resolve.NewResolverTree(s.Definitions)
	rr, err := rt.BuildResolver(rootPair)
	if err != nil {
		return err
	}

	s.queryResolver = rr
	s.rootResolver = reflect.ValueOf(rootQueryResolver)
	return nil
}

type QueryExecution interface {
	Wait()
	Cancel()
}

// Start execution of a query tree.
func (s *Schema) StartQuery(ctx context.Context, query *qtree.QueryTreeNode) QueryExecution {
	return resolve.StartQuery(s.queryResolver, ctx, s.rootResolver, query)
}
