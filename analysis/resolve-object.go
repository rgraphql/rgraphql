package analysis

import (
	gast "go/ast"
	gtoken "go/token"
	gtypes "go/types"
	"slices"
	"strconv"
	"strings"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/pkg/errors"
)

// objectResolver resolves an object and fields selected by the query.
type objectResolver struct {
	// Type name of the GraphQL type
	typeName string
	// Go resolver type name
	goTypeName *gtypes.TypeName
	// Go resolver func name
	goGenResolverFuncName string
	// Field resolvers
	fieldResolvers map[string]Resolver
	// Fields marked as arrays
	arrayFields map[string]bool
}

// GetName returns the function resolver name.
func (r *objectResolver) GetName() string {
	return r.goGenResolverFuncName
}

// GenerateGoASTDecls generates Go declarations to fulfill the resolver.
func (r *objectResolver) GenerateGoASTDecls() ([]gast.Decl, error) {
	var resolverFnStmts []gast.Stmt
	// if r == nil { resolveNullValue() }
	writeNullValueExpr := &gast.CallExpr{
		Fun: &gast.SelectorExpr{
			X:   gast.NewIdent("rctx"),
			Sel: gast.NewIdent("WriteValue"),
		},
		Args: []gast.Expr{
			// Null value object
			&gast.CallExpr{
				Fun: &gast.SelectorExpr{
					X:   gast.NewIdent("resolver"),
					Sel: gast.NewIdent("BuildNullValue"),
				},
			},
			// Indicate if the value is "final"
			gast.NewIdent("true"),
		},
	}

	// append the initial r == nil check
	resolverFnStmts = append(resolverFnStmts, &gast.IfStmt{
		Cond: &gast.BinaryExpr{
			Op: gtoken.EQL,
			X:  gast.NewIdent("r"),
			Y:  gast.NewIdent("nil"),
		},

		// { rctx.WriteValue(...); return }
		Body: &gast.BlockStmt{
			Lbrace: gtoken.NoPos,
			Rbrace: gtoken.NoPos,
			List: []gast.Stmt{
				&gast.ExprStmt{X: writeNullValueExpr},
				&gast.ReturnStmt{},
			},
		},
	})

	// generate the elements for the field map.
	// key: fieldName, value: func(rctx *resolver.Context) -> ...
	var fieldMapElts []gast.Expr
	for fieldName, fieldResolver := range r.fieldResolvers {
		stmts, err := fieldResolver.GenerateGoASTRef()
		if err != nil {
			return nil, errors.Wrap(err, "unable to build field "+fieldName)
		}

		// fieldFunc is the field resolver: fieldid: func(rctx *resolver.Context)
		fieldFunc := &gast.FuncLit{
			Type: &gast.FuncType{
				Func: gtoken.NoPos,
				Params: &gast.FieldList{
					Opening: gtoken.NoPos,
					Closing: gtoken.NoPos,
					List: []*gast.Field{
						{
							Names: []*gast.Ident{
								gast.NewIdent("rctx"),
							},
							Type: &gast.StarExpr{
								Star: gtoken.NoPos,
								X: &gast.SelectorExpr{
									X:   gast.NewIdent(resolverPkg),
									Sel: gast.NewIdent("Context"),
								},
							},
						},
					},
				},
			},
			Body: &gast.BlockStmt{
				Lbrace: gtoken.NoPos,
				Rbrace: gtoken.NoPos,
				List:   stmts,
			},
		}

		fieldMapElts = append(fieldMapElts, &gast.KeyValueExpr{
			Key: &gast.BasicLit{
				Kind:     gtoken.STRING,
				ValuePos: gtoken.NoPos,
				Value:    strconv.Quote(fieldName),
			},
			Value: fieldFunc,
		})
	}

	slices.SortFunc(fieldMapElts, func(a, b gast.Expr) int {
		kvi := a.(*gast.KeyValueExpr)
		kvj := b.(*gast.KeyValueExpr)
		return strings.Compare(kvi.Key.(*gast.BasicLit).Value, kvj.Key.(*gast.BasicLit).Value)
	})

	// Create ResolveObject call with field resolver function
	resolverFnStmts = append(resolverFnStmts, &gast.ExprStmt{
		X: &gast.CallExpr{
			Fun: &gast.SelectorExpr{
				X:   gast.NewIdent("resolver"),
				Sel: gast.NewIdent("ResolveObject"),
			},
			Args: []gast.Expr{
				gast.NewIdent("rctx"),
				&gast.FuncLit{
					Type: &gast.FuncType{
						Params: &gast.FieldList{
							List: []*gast.Field{
								{
									Names: []*gast.Ident{gast.NewIdent("fieldName")},
									Type:  gast.NewIdent("string"),
								},
							},
						},
						Results: &gast.FieldList{
							List: []*gast.Field{
								{
									Type: &gast.SelectorExpr{
										X:   gast.NewIdent("resolver"),
										Sel: gast.NewIdent("FieldResolver"),
									},
								},
							},
						},
					},
					Body: &gast.BlockStmt{
						List: []gast.Stmt{
							&gast.DeclStmt{
								Decl: &gast.GenDecl{
									Tok: gtoken.VAR,
									Specs: []gast.Spec{
										&gast.ValueSpec{
											Names: []*gast.Ident{gast.NewIdent("fieldResolver")},
											Type: &gast.SelectorExpr{
												X:   gast.NewIdent("resolver"),
												Sel: gast.NewIdent("FieldResolver"),
											},
										},
									},
								},
							},
							&gast.SwitchStmt{
								Tag:  gast.NewIdent("fieldName"),
								Body: &gast.BlockStmt{List: make([]gast.Stmt, len(fieldMapElts))},
							},
							&gast.ReturnStmt{
								Results: []gast.Expr{gast.NewIdent("fieldResolver")},
							},
						},
					},
				},
			},
		},
	})

	// Add case statements in deterministic order
	switchStmt := resolverFnStmts[len(resolverFnStmts)-1].(*gast.ExprStmt).X.(*gast.CallExpr).Args[1].(*gast.FuncLit).Body.List[1].(*gast.SwitchStmt)
	for i, elt := range fieldMapElts {
		kv := elt.(*gast.KeyValueExpr)
		switchStmt.Body.List[i] = &gast.CaseClause{
			List: []gast.Expr{kv.Key},
			Body: []gast.Stmt{
				&gast.AssignStmt{
					Lhs: []gast.Expr{gast.NewIdent("fieldResolver")},
					Tok: gtoken.ASSIGN,
					Rhs: []gast.Expr{kv.Value},
				},
			},
		}
	}

	// TODO: generate func ResolveMyType(rctx *resolver.Context, r *MyTypeResolver)
	resolverFnName := r.goGenResolverFuncName
	resolverFnDecl := &gast.FuncDecl{
		Name: gast.NewIdent(resolverFnName),
		Type: &gast.FuncType{
			Params: &gast.FieldList{
				List: []*gast.Field{
					{
						Names: []*gast.Ident{
							gast.NewIdent("rctx"),
						},
						Type: &gast.StarExpr{
							X: &gast.SelectorExpr{
								X:   gast.NewIdent(resolverPkg),
								Sel: gast.NewIdent("Context"),
							},
						},
					},
					{
						Names: []*gast.Ident{
							gast.NewIdent("r"),
						},
						// TODO: determine namespace of the resolver struct
						Type: &gast.StarExpr{
							X: &gast.SelectorExpr{
								X:   gast.NewIdent(r.goTypeName.Pkg().Name()),
								Sel: gast.NewIdent(r.goTypeName.Name()),
							},
						},
					},
				},
			},
		},
		Body: &gast.BlockStmt{
			Lbrace: gtoken.NoPos,
			Rbrace: gtoken.NoPos,
			List:   resolverFnStmts,
		},
	}

	return []gast.Decl{resolverFnDecl}, nil
}

// GenerateGoASTRef generates the Go statements to call the resolver.
func (r *objectResolver) GenerateGoASTRef() ([]gast.Stmt, error) {
	return []gast.Stmt{
		&gast.GoStmt{
			Call: &gast.CallExpr{
				Lparen: gtoken.NoPos,
				Rparen: gtoken.NoPos,
				Fun:    gast.NewIdent(r.goGenResolverFuncName),
				Args: []gast.Expr{
					gast.NewIdent("rctx"),
					gast.NewIdent("v"),
				},
			},
		},
	}, nil
}

// Build resolvers for an object.
func (rt *modelBuilder) buildObjectResolver(pair typeResolverPair, odef *ast.ObjectDefinition) (Resolver, error) {
	resolverTypePtr, _ := pair.ResolverType.(*gtypes.Pointer)
	resolverTypeNamed, _ := pair.ResolverType.(*gtypes.Named)
	if resolverTypeNamed == nil {
		if resolverTypePtr != nil {
			resolverTypeNamed, _ = resolverTypePtr.Elem().(*gtypes.Named)
		}
		if resolverTypeNamed == nil {
			return nil, errors.Errorf("expected types.named for object resolver")
		}
	}

	objr := &objectResolver{
		typeName:              odef.Name.Value,
		goGenResolverFuncName: "Resolve" + odef.Name.Value, // TODO: ensure uniqueness
		goTypeName:            resolverTypeNamed.Obj(),
		fieldResolvers:        make(map[string]Resolver),
		arrayFields:           make(map[string]bool),
	}
	rt.resolvers[pair] = objr
	rt.imports[resolverTypeNamed.Obj().Pkg().Path()] = struct{}{}

	// Foreach field, expect a resolver function.
	for _, field := range odef.Fields {
		if field.Name == nil ||
			field.Name.Value == "" ||
			field.Name.Value == "__schema" {
			continue
		}

		resolverType := pair.ResolverType
		resolverFunc, err := findResolverFunc(resolverType, field.Name.Value)
		if err != nil {
			return nil, err
		}

		// Build function executor.
		fieldResolver, err := rt.buildFuncResolver(resolverFunc, field)
		if err != nil {
			return nil, err
		}
		objr.fieldResolvers[field.Name.Value] = fieldResolver

		// Strip not-null, check if list
		ftyp := field.Type
		if nn, ok := ftyp.(*ast.NonNull); ok {
			ftyp = nn.Type
		}
		if _, ok := ftyp.(*ast.List); ok {
			objr.arrayFields[field.Name.Value] = true
		}
	}

	return objr, nil
}

var _ Resolver = ((*objectResolver)(nil))
