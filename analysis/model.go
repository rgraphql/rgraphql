package analysis

import (
	"errors"
	gast "go/ast"
	"go/token"
	gtypes "go/types"
	"sort"

	"github.com/graphql-go/graphql/language/ast"
)

// Model defines the linkage between a GraphQL schema and a codebase.
// Schema types are bound to Go types, for example:
//   - Object type bound to Go struct or interface type
//   - Array type bound to Go struct or channel type
//   - Any type bound to Go channel(s) indicating mutable real-time value
//
// This representation yields Resolver implementations that emit Go code to resolve at runtime.
type Model struct {
	rootResolver Resolver
	allResolvers []Resolver
	rootSchema   *ast.ObjectDefinition
	imports      []string
}

// BuildModel computes the execution model from a schema and code sample.
func BuildModel(
	rootSchema *ast.ObjectDefinition,
	astLookup ASTLookup,
	rootResolverType gtypes.Type,
) (*Model, error) {
	if rootResolverType == nil {
		return nil, errors.New("root resolver type cannot be nil")
	}
	if rootSchema == nil {
		return nil, errors.New("root schema cannot be nil")
	}

	mb := newModelBuilder(astLookup)
	br, err := mb.buildResolver(typeResolverPair{
		ResolverType: rootResolverType,
		ASTType:      rootSchema,
	})
	if err != nil {
		return nil, err
	}

	allResolvers := make([]Resolver, 0, len(mb.resolvers))
	for _, resolver := range mb.resolvers {
		allResolvers = append(allResolvers, resolver)
	}
	sort.Slice(allResolvers, func(i, j int) bool {
		return allResolvers[i].GetName() < allResolvers[j].GetName()
	})

	imports := make([]string, 0, len(mb.imports))
	for ipath := range mb.imports {
		imports = append(imports, ipath)
	}

	return &Model{
		rootResolver: br,
		rootSchema:   rootSchema,
		allResolvers: allResolvers,
		imports:      imports,
	}, nil
}

// GenerateResolverFile generates the Go resolver file.
func (m *Model) GenerateResolverFile() (*gast.File, error) {
	allResolvers := m.GetAllResolvers()
	allDecls := []gast.Decl{
		&gast.GenDecl{
			Tok: token.IMPORT,
			Specs: []gast.Spec{
				&gast.ImportSpec{
					Path: &gast.BasicLit{
						Kind:  token.STRING,
						Value: `"context"`,
					},
				},
			},
		},
		&gast.GenDecl{
			Tok: token.IMPORT,
			Specs: []gast.Spec{
				&gast.ImportSpec{
					Path: &gast.BasicLit{
						Kind:  token.STRING,
						Value: `"github.com/rgraphql/rgraphql/resolver"`,
					},
				},
			},
		},
	}

	for _, imp := range m.GetImportPaths() {
		allDecls = append(allDecls, &gast.GenDecl{
			Tok: token.IMPORT,
			Specs: []gast.Spec{
				&gast.ImportSpec{
					Path: &gast.BasicLit{
						Kind:  token.STRING,
						Value: `"` + imp + `"`,
					},
				},
			},
		})
	}

	for _, resolver := range allResolvers {
		decls, err := resolver.GenerateGoASTDecls()
		if err != nil {
			return nil, err
		}
		if len(decls) > 0 {
			allDecls = append(allDecls, decls...)
		}
	}

	allDecls = append(allDecls, &gast.GenDecl{
		Tok: token.VAR,
		Specs: []gast.Spec{
			&gast.ValueSpec{
				Names: []*gast.Ident{
					gast.NewIdent("_"),
				},
				Type: &gast.SelectorExpr{
					X:   gast.NewIdent("context"),
					Sel: gast.NewIdent("Context"),
				},
			},
		},
	})

	return &gast.File{
		Name:    gast.NewIdent("resolve"),
		Package: 5, // Force after build tag.
		/*
			Comments: []*gast.CommentGroup{
				&gast.CommentGroup{
					List: []*gast.Comment{
						&gast.Comment{
							Text: "//+build !rgraphql_analyze",
						},
					},
				},
			},
		*/
		Decls: allDecls,
	}, nil
}

// GetRootResolver returns the root resolver reference.
func (m *Model) GetRootResolver() Resolver {
	return m.rootResolver
}

// GetAllResolvers returns the list of all generated resolvers.
func (m *Model) GetAllResolvers() []Resolver {
	return m.allResolvers
}

// GetImportPaths returns the import path list.
func (m *Model) GetImportPaths() []string {
	return m.imports
}
