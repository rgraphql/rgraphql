package client

import (
	"github.com/graphql-go/graphql/language/ast"
	"github.com/pkg/errors"
)

// Query is a query operation attached to a query tree.
type Query struct {
	// ast is the underlying AST for the query
	ast *ast.OperationDefinition
}

// NewQuery builds a new query object.
func NewQuery(ast *ast.OperationDefinition) (*Query, error) {
	if ast.GetOperation() != "query" {
		return nil, errors.New("expected query operation")
	}

	return &Query{ast: ast}, nil
}
