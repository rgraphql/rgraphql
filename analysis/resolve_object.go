package analysis

import (
	gast "go/ast"
	gtoken "go/token"
	gtypes "go/types"
	"sort"
	"strconv"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/pkg/errors"
	"github.com/rgraphql/magellan/schema"
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
func (o *objectResolver) GenerateGoASTDecls() ([]gast.Decl, error) {
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
	// key: crc32(fieldName), value: func(rctx *resolver.Context) -> ...
	var fieldMapElts []gast.Expr
	for fieldName, fieldResolver := range o.fieldResolvers {
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
				Kind:     gtoken.INT,
				ValuePos: gtoken.NoPos,
				Value:    strconv.Itoa(int(schema.HashFieldName(fieldName))),
			},
			Value: fieldFunc,
		})
	}

	sort.Slice(fieldMapElts, func(i, j int) bool {
		kvi := fieldMapElts[i].(*gast.KeyValueExpr)
		kvj := fieldMapElts[j].(*gast.KeyValueExpr)
		return kvi.Key.(*gast.BasicLit).Value < kvj.Key.(*gast.BasicLit).Value
	})

	// append the field map declaration
	// fieldMap := map[uint32]resolver.FieldResolver{
	fieldMapIdent := "fieldMap"
	resolverFnStmts = append(resolverFnStmts, &gast.AssignStmt{
		Tok: gtoken.DEFINE,
		Lhs: []gast.Expr{
			gast.NewIdent(fieldMapIdent),
		},
		Rhs: []gast.Expr{
			&gast.CompositeLit{
				Type: &gast.MapType{
					Key: gast.NewIdent("uint32"),
					Value: &gast.SelectorExpr{
						X:   gast.NewIdent(resolverPkg),
						Sel: gast.NewIdent("FieldResolver"),
					},
				},
				Elts: fieldMapElts,
			},
		},
	})
	resolverFnStmts = append(resolverFnStmts, &gast.ExprStmt{
		X: &gast.CallExpr{
			Lparen: gtoken.NoPos,
			Rparen: gtoken.NoPos,
			Fun: &gast.SelectorExpr{
				X:   gast.NewIdent(resolverPkg),
				Sel: gast.NewIdent("ResolveObject"),
			},
			Args: []gast.Expr{
				gast.NewIdent("rctx"),
				gast.NewIdent(fieldMapIdent),
			},
		},
	})

	// TODO: generate func ResolveMyType(rctx *resolver.Context, r *MyTypeResolver)
	resolverFnName := o.goGenResolverFuncName
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
								X:   gast.NewIdent(o.goTypeName.Pkg().Name()),
								Sel: gast.NewIdent(o.goTypeName.Name()),
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

	/*
		objr.introspectResolver = reflect.ValueOf(&introspect.ObjectResolver{
			Lookup:         rt.Lookup,
			AST:            odef,
			SchemaResolver: rt.IntrospectionResolver,
		})
	*/

	// Foreach field, expect a resolver function.
	for _, field := range odef.Fields {
		if field.Name == nil ||
			field.Name.Value == "" ||
			field.Name.Value == "__schema" {
			continue
		}

		resolverType := pair.ResolverType
		/*
			var resolverType reflect.Type
			switch field.Name.Value {
			 case "__schema":
			 	fallthrough
			 case "__type":
			 	resolverType = introspect.ObjectResolverType
			default:
				resolverType = pair.ResolverType
			}
		*/

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

	/*
		tnResolver, err := rt.buildPrimitiveResolver(reflect.TypeOf(""), stringTypeRef)
		if err != nil {
			return nil, err
		}
		objr.fieldResolvers["__typename"] = tnResolver
	*/

	return objr, nil
}

var _ Resolver = ((*objectResolver)(nil))
