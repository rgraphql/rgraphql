package analysis

import (
	gast "go/ast"
	gtoken "go/token"
	gtypes "go/types"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/pkg/errors"
)

type listResolver struct {
	isPtr        bool
	elemResolver Resolver
}

// GetName returns the function resolver name.
func (r *listResolver) GetName() string {
	return ""
}

// GenerateGoASTDecls generates Go declarations to fulfill the resolver.
func (r *listResolver) GenerateGoASTDecls() ([]gast.Decl, error) {
	return nil, nil
}

// GenerateGoASTRef generates the Go statements to call the resolver.
func (r *listResolver) GenerateGoASTRef() ([]gast.Stmt, error) {
	// resolver.ResolveSlice(rctx, len(v), func(rctx *resolver.Context, i int) {
	//     resolver.ResolvePerson(rctx, v[i])
	// })
	var stmts []gast.Stmt

	resolveValueStmts := []gast.Stmt{
		&gast.AssignStmt{
			Tok: gtoken.DEFINE,
			Lhs: []gast.Expr{
				gast.NewIdent("v"),
			},
			Rhs: []gast.Expr{
				&gast.IndexExpr{
					X:     gast.NewIdent("v"),
					Index: gast.NewIdent("i"),
				},
			},
		},
	}

	rvs, err := r.elemResolver.GenerateGoASTRef()
	if err != nil {
		return nil, err
	}

	resolveValueStmts = append(resolveValueStmts, rvs...)
	stmts = append(stmts, &gast.ExprStmt{
		X: &gast.CallExpr{
			Fun: &gast.SelectorExpr{
				X:   gast.NewIdent(resolverPkg),
				Sel: gast.NewIdent("ResolveSlice"),
			},
			Args: []gast.Expr{
				gast.NewIdent(rctxRef),
				&gast.CallExpr{
					Fun:  gast.NewIdent("len"),
					Args: []gast.Expr{gast.NewIdent("v")},
				},
				&gast.FuncLit{
					Type: &gast.FuncType{
						Params: &gast.FieldList{
							List: []*gast.Field{
								{
									Names: []*gast.Ident{
										gast.NewIdent(rctxRef),
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
										gast.NewIdent("i"),
									},
									Type: gast.NewIdent("int"),
								},
							},
						},
					},
					Body: &gast.BlockStmt{
						List: resolveValueStmts,
					},
				},
			},
		},
	})

	return stmts, nil
}

var _ Resolver = ((*listResolver)(nil))

type chanListResolver struct {
	*listResolver
}

func (rt *modelBuilder) buildListResolver(pair typeResolverPair, ldef *ast.List) (Resolver, error) {
	rtType := pair.ResolverType
	rtTypeUnderlying := rtType.Underlying()
	rtTypePtr, isPtr := rtTypeUnderlying.(*gtypes.Pointer)
	if isPtr {
		rtType = rtTypePtr.Elem()
		rtTypeUnderlying = rtType.Underlying()
	}

	var rtTypeElem gtypes.Type
	rtTypeChan, isChan := rtTypeUnderlying.(*gtypes.Chan)
	rtTypeSlice, isSlice := rtTypeUnderlying.(*gtypes.Slice)
	if isChan {
		rtTypeElem = rtTypeChan.Elem()
		if rtTypeChan.Dir() != gtypes.RecvOnly {
			return nil, errors.Errorf(
				"invalid list type %s, (should be a <-chan)",
				pair.ResolverType.String(),
			)
		}
	} else if isSlice {
		rtTypeElem = rtTypeSlice.Elem()
	} else {
		return nil, errors.Errorf(
			"expected array type, got %v (should be a slice or a chan)",
			pair.ResolverType.String(),
		)
	}

	// The type in the pair will be a []*ResolverType or []ResolverType or <-chan ResolverType etc...
	elemPtr, elemIsPtr := rtTypeElem.(*gtypes.Pointer)
	if elemIsPtr {
		rtTypeElem = elemPtr.Elem()
	}

	var cres *chanListResolver
	res := &listResolver{isPtr: isPtr}
	if isChan {
		cres = &chanListResolver{listResolver: res}
		rt.resolvers[pair] = cres
		return nil, errors.Errorf("chan list resolver unimplemented: %#v", rtType.String())
	} else {
		rt.resolvers[pair] = res
	}

	// Follow list element
	elemResolver, err := rt.buildResolver(typeResolverPair{
		ResolverType: rtTypeElem,
		ASTType:      ldef.Type,
	})
	if err != nil {
		return nil, err
	}
	res.elemResolver = elemResolver

	if isChan {
		return cres, nil
	}

	return res, nil
}
