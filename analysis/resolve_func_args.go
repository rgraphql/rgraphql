package analysis

import (
	gast "go/ast"
	gtoken "go/token"
	"sort"
)

type funcResolverArg struct {
	index int
	value gast.Expr
}

type funcResolverArgs []*funcResolverArg

func (f funcResolverArgs) Len() int {
	return len(f)
}

func (f funcResolverArgs) Less(i, j int) bool {
	argi := f[i]
	argj := f[j]
	return argi.index < argj.index
}

func (f funcResolverArgs) Swap(i, j int) {
	tmp := f[i]
	f[i] = f[j]
	f[j] = tmp
}

// generateFuncParams generates the function parameters and sorts them.
func (r *funcResolver) generateFuncParams() funcResolverArgs {
	var funcParams funcResolverArgs
	if r.outputChanArg != 0 {
		funcParams = append(funcParams, &funcResolverArg{
			index: r.outputChanArg - 1,
			value: gast.NewIdent(outChRef),
		})
	}
	if r.contextArg != 0 {
		funcParams = append(funcParams, &funcResolverArg{
			index: r.contextArg - 1,
			value: gast.NewIdent(ctxRef),
		})
	}
	if r.argsArg != 0 {
		funcParams = append(funcParams, &funcResolverArg{
			index: r.argsArg - 1,
			value: gast.NewIdent(argsRef),
		})
	}
	sort.Sort(funcParams)
	return funcParams
}

// generateArgsConstructor generates the arguments constructor and field setters.
func (r *funcResolver) generateArgsConstructor() ([]gast.Stmt, error) {
	var stmts []gast.Stmt
	// rargs := &query.MyArgs{}
	argsTypeRef, err := buildGoTypeReferenceExpr(r.argsType)
	if err != nil {
		return nil, err
	}

	// Dereference pointer.
	if starRef, ok := argsTypeRef.(*gast.StarExpr); ok {
		argsTypeRef = starRef.X
	}

	stmts = append(stmts, &gast.AssignStmt{
		Lhs: []gast.Expr{
			gast.NewIdent(argsRef),
		},
		Tok: gtoken.DEFINE,
		Rhs: []gast.Expr{
			&gast.UnaryExpr{
				Op: gtoken.AND,
				X: &gast.CompositeLit{
					Type: argsTypeRef,
				},
			},
		},
	})

	// if argVar := rctx.QNode.Arguments[]
	for fieldName, arg := range r.argsFields {
		valIdent := "val"
		getValFn := "GetStringValue" // TODO

		stmts = append(stmts, &gast.IfStmt{
			Init: &gast.AssignStmt{
				Lhs: []gast.Expr{
					gast.NewIdent(argVarRef),
				},
				Tok: gtoken.DEFINE,
				Rhs: []gast.Expr{
					&gast.CallExpr{
						Fun: &gast.SelectorExpr{
							X:   gast.NewIdent(rctxRef),
							Sel: gast.NewIdent("GetQueryArgument"),
						},
						Args: []gast.Expr{
							&gast.BasicLit{
								Kind:  gtoken.STRING,
								Value: `"` + fieldName + `"`,
							},
						},
					},
				},
			},
			Cond: &gast.BinaryExpr{
				Op: gtoken.NEQ,
				X:  gast.NewIdent(argVarRef),
				Y:  gast.NewIdent("nil"),
			},
			Body: &gast.BlockStmt{
				List: []gast.Stmt{
					&gast.AssignStmt{
						Lhs: []gast.Expr{
							gast.NewIdent(valIdent),
						},
						Tok: gtoken.DEFINE,
						Rhs: []gast.Expr{
							&gast.CallExpr{
								Fun: &gast.SelectorExpr{
									X: &gast.CallExpr{
										Fun: &gast.SelectorExpr{
											X:   gast.NewIdent(argVarRef),
											Sel: gast.NewIdent("GetValue"),
										},
									},
									Sel: gast.NewIdent(getValFn),
								},
							},
						},
					},
					&gast.AssignStmt{
						Lhs: []gast.Expr{
							&gast.SelectorExpr{
								X:   gast.NewIdent(argsRef),
								Sel: gast.NewIdent(arg.fieldName),
							},
						},
						Tok: gtoken.ASSIGN,
						Rhs: []gast.Expr{
							gast.NewIdent(valIdent),
						},
					},
				},
			},
		})
	}
	return stmts, nil
}
