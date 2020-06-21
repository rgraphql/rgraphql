package analysis

import (
	gast "go/ast"
	gtypes "go/types"

	"github.com/graphql-go/graphql/language/ast"
)

// resolverPkg is the identifier used to reference the "resolver" package
var resolverPkg = "resolver"

// Resolver implements resolution of a piece of the schema with Go code.
type Resolver interface {
	// GetName returns the resolver name.
	// This is typically the function name.
	GetName() string
	// GenerateGoASTDecls generates Go declarations to fulfill the resolver.
	GenerateGoASTDecls() ([]gast.Decl, error)
	// GenerateGoASTRef generates the Go statements to call the resolver.
	GenerateGoASTRef() ([]gast.Stmt, error)
}

// typeResolverPair represents a graphql AST type and its Go resolver.
type typeResolverPair struct {
	ASTType      ast.Node
	ResolverType gtypes.Type
}
