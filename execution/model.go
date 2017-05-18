package execution

import (
	"context"
	"errors"
	"fmt"
	"reflect"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/introspect"
	"github.com/rgraphql/magellan/qtree"
)

// Model represents the code structure of a GraphQL schema resolver.
type Model struct {
	rootResolver     Resolver // The root resolver of the schema.
	rootResolverType reflect.Type
	serialOnly       bool
}

// IsSerialOnly checks if the model should only be executed in serial.
func (m *Model) IsSerialOnly() bool {
	return m.serialOnly
}

// ValidateResolverInstance checks if the given resolver's type matches the root resolver type.
func (m *Model) ValidateResolverInstance(resolverInstance interface{}) error {
	rt := reflect.TypeOf(resolverInstance)
	if rt != m.rootResolverType {
		return fmt.Errorf("Given resolver type %s must match model resolver type %s", rt.Name(), m.rootResolverType.Name())
	}
	return nil
}

// Execute starts executing the model with a given resolverInstance.
func (m *Model) Execute(ctx context.Context, writer ResolverWriter, queryTree *qtree.QueryTreeNode, resolverInstance interface{}, serial bool) (*ExecutionContext, error) {
	if err := m.ValidateResolverInstance(resolverInstance); err != nil {
		return nil, err
	}

	rootCtx := NewRootResolverContext(ctx, writer, serial, queryTree)
	rootCtx.SetQueryNode(queryTree)
	rv := reflect.ValueOf(resolverInstance)
	go m.rootResolver.Execute(rootCtx, rv)
	return rootCtx.ExecutionContext, nil
}

// ASTLookup must lookup types in the original schema.
type ASTLookup interface {
	LookupType(ast.Type) ast.TypeDefinition
}

// modelBuilder maintains context when analyzing the source AST.
type modelBuilder struct {
	Lookup                ASTLookup
	Resolvers             map[typeResolverPair]Resolver
	SerialOnly            bool
	IntrospectionResolver *introspect.SchemaResolver
}

// BuildModel builds an execution model from a schema and from the code AST.
func BuildModel(rootSchema *ast.ObjectDefinition, astLookup ASTLookup, introspectionResolver *introspect.SchemaResolver, rootResolver interface{}, serialOnly bool) (*Model, error) {
	if rootResolver == nil {
		return nil, errors.New("Root resolver object must be given.")
	}
	if rootSchema == nil {
		return nil, errors.New("Root schema object must be given.")
	}

	rootResolverType := reflect.TypeOf(rootResolver)
	mb := &modelBuilder{
		Resolvers:             make(map[typeResolverPair]Resolver),
		SerialOnly:            serialOnly,
		IntrospectionResolver: introspectionResolver,
		Lookup:                astLookup,
	}
	br, err := mb.buildResolver(typeResolverPair{ResolverType: rootResolverType, Type: rootSchema})
	if err != nil {
		return nil, err
	}

	return &Model{
		rootResolver:     br,
		rootResolverType: rootResolverType,
		serialOnly:       serialOnly,
	}, nil
}
