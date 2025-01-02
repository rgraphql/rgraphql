package analysis

import (
	gast "go/ast"
	"go/token"
	gtoken "go/token"
)

// generateOutputChanProcessor generates the statements to process a streaming resolver.
func (r *funcResolver) generateOutputChanProcessor(
	resolverCallExpr gast.Expr,
	resolveResultStmts []gast.Stmt,
) ([]gast.Stmt, error) {
	var stmts []gast.Stmt
	refExpr, err := buildGoTypeReferenceExpr(r.outputType)
	if err != nil {
		return nil, err
	}

	// outCh := make(chan string)
	stmts = append(stmts, &gast.AssignStmt{
		Lhs: []gast.Expr{
			gast.NewIdent(outChRef),
		},
		Tok: gtoken.DEFINE,
		Rhs: []gast.Expr{
			&gast.CallExpr{
				Fun: gast.NewIdent("make"),
				Args: []gast.Expr{
					&gast.ChanType{
						Begin: gtoken.NoPos,
						Arrow: gtoken.NoPos,
						Dir:   gast.SEND | gast.RECV,
						Value: refExpr,
					},
				},
			},
		},
	})

	// errCh := make(chan error, 1)
	if r.returnsError {
		stmts = append(stmts, &gast.AssignStmt{
			Lhs: []gast.Expr{
				gast.NewIdent(errChRef),
			},
			Tok: gtoken.DEFINE,
			Rhs: []gast.Expr{
				&gast.CallExpr{
					Fun: gast.NewIdent("make"),
					Args: []gast.Expr{
						&gast.ChanType{
							Begin: gtoken.NoPos,
							Arrow: gtoken.NoPos,
							Dir:   gast.SEND | gast.RECV,
							Value: gast.NewIdent("error"),
						},
						gast.NewIdent("1"),
					},
				},
			},
		})
	}

	// resolveStmts is the contents of the go func() {} inline block
	var resolveStmts []gast.Stmt
	if r.returnsError {
		// errCh <- r.MyField()...
		resolveStmts = append(resolveStmts, &gast.SendStmt{
			Chan:  gast.NewIdent(errChRef),
			Value: resolverCallExpr,
		})
	} else {
		// r.MyField()...
		resolveStmts = append(resolveStmts, &gast.ExprStmt{
			X: resolverCallExpr,
		})
	}

	// go func() {}
	stmts = append(stmts, &gast.GoStmt{
		Call: &gast.CallExpr{
			Fun: &gast.FuncLit{
				Type: &gast.FuncType{Params: &gast.FieldList{}},
				Body: &gast.BlockStmt{
					List: resolveStmts,
				},
			},
		},
	})

	// Now we need to process outCh and errCh.
	// resolveValueStmts is the contents of the case v := <-outCh block.
	var resolveValueStmts []gast.Stmt
	if r.outputIsList {
		stmts = append(stmts, &gast.DeclStmt{
			Decl: &gast.GenDecl{
				Tok: gtoken.VAR,
				Specs: []gast.Spec{
					&gast.ValueSpec{
						Names: []*gast.Ident{
							gast.NewIdent(resultIndexRef),
						},
						Type: gast.NewIdent("uint32"),
					},
				},
			},
		})

		resolveValueStmts = append(resolveValueStmts, &gast.AssignStmt{
			Tok: gtoken.DEFINE,
			Lhs: []gast.Expr{
				gast.NewIdent(rctxRef),
			},
			Rhs: []gast.Expr{
				&gast.CallExpr{
					Fun: &gast.SelectorExpr{
						X:   gast.NewIdent(rctxRef),
						Sel: gast.NewIdent("ArrayChild"),
					},
					Args: []gast.Expr{
						gast.NewIdent(resultIndexRef),
					},
				},
			},
		}, &gast.IncDecStmt{
			Tok: gtoken.INC,
			X:   gast.NewIdent(resultIndexRef),
		})
	} else {
		resolveValueStmts = append(
			resolveValueStmts,
			&gast.IfStmt{
				Cond: &gast.BinaryExpr{
					Op: token.NEQ,
					X:  gast.NewIdent(vctxRef),
					Y:  gast.NewIdent("nil"),
				},
				Body: &gast.BlockStmt{
					List: []gast.Stmt{
						&gast.ExprStmt{
							X: &gast.CallExpr{
								Fun: &gast.SelectorExpr{
									X:   gast.NewIdent(vctxRef),
									Sel: gast.NewIdent("Purge"),
								},
							},
						},
					},
				},
			},
			&gast.AssignStmt{
				Lhs: []gast.Expr{
					gast.NewIdent(vctxRef),
				},
				Tok: token.ASSIGN,
				Rhs: []gast.Expr{
					&gast.CallExpr{
						Fun: &gast.SelectorExpr{
							X:   gast.NewIdent(rctxRef),
							Sel: gast.NewIdent("VirtualChild"),
						},
					},
				},
			},
			&gast.AssignStmt{
				Lhs: []gast.Expr{
					gast.NewIdent(rctxRef),
				},
				Tok: token.DEFINE,
				Rhs: []gast.Expr{
					gast.NewIdent(vctxRef),
				},
			},
		)
	}

	// resolver.ResolveValue(...)
	// TODO: figure out how to mark isFinal=false here.
	resolveValueStmts = append(resolveValueStmts, resolveResultStmts...)

	commClauses := []gast.Stmt{
		// case <-ctx.Done()
		&gast.CommClause{
			Comm: &gast.ExprStmt{
				X: &gast.UnaryExpr{
					Op: gtoken.ARROW,
					X: &gast.CallExpr{
						Fun: &gast.SelectorExpr{
							X:   gast.NewIdent(ctxRef),
							Sel: gast.NewIdent("Done"),
						},
					},
				},
			},
			// return
			Body: []gast.Stmt{&gast.ReturnStmt{}},
		},

		// case v := <-outCh:
		&gast.CommClause{
			Comm: &gast.AssignStmt{
				Tok: gtoken.DEFINE,
				Lhs: []gast.Expr{
					gast.NewIdent("v"),
				},
				Rhs: []gast.Expr{
					&gast.UnaryExpr{
						Op: gtoken.ARROW,
						X:  gast.NewIdent(outChRef),
					},
				},
			},
			Body: resolveValueStmts,
		},
	}
	if r.returnsError {
		// case err := <-errCh:
		commClauses = append(
			commClauses,
			&gast.CommClause{
				Comm: &gast.AssignStmt{
					Tok: gtoken.DEFINE,
					Lhs: []gast.Expr{
						gast.NewIdent("err"),
					},
					Rhs: []gast.Expr{
						&gast.UnaryExpr{
							Op: gtoken.ARROW,
							X:  gast.NewIdent(errChRef),
						},
					},
				},
				Body: []gast.Stmt{
					&gast.ExprStmt{
						X: &gast.CallExpr{
							Fun: &gast.SelectorExpr{
								X:   gast.NewIdent(resolverPkg),
								Sel: gast.NewIdent("ResolveError"),
							},
							Args: []gast.Expr{
								gast.NewIdent(rctxRef),
								gast.NewIdent("err"),
							},
						},
					},
					&gast.ReturnStmt{},
				},
			},
		)
	}
	stmts = append(stmts, &gast.ForStmt{
		Body: &gast.BlockStmt{
			List: []gast.Stmt{
				&gast.SelectStmt{
					Body: &gast.BlockStmt{
						List: commClauses,
					},
				},
			},
		},
	})

	return stmts, nil
}
