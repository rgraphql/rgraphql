package analysis

import (
	gast "go/ast"
	gtoken "go/token"
	gtypes "go/types"
	"strconv"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/pkg/errors"
	proto "github.com/rgraphql/rgraphql"
	"github.com/rgraphql/rgraphql/resolver"
	"github.com/rgraphql/rgraphql/types"
	"github.com/rgraphql/rgraphql/types/gqlast"
)

// primitiveResolver is the final step once we reach a primitive.
// It is responsible for actually transmitting base values.
type primitiveResolver struct {
	ptrDepth  int
	convertTo gtypes.Object
	primKind  proto.RGQLPrimitive_Kind
}

// GetName returns the name.
func (r *primitiveResolver) GetName() string {
	return ""
}

// GenerateGoASTDecls generates Go declarations to fulfill the resolver.
func (r *primitiveResolver) GenerateGoASTDecls() ([]gast.Decl, error) {
	// var decls []gast.Decl
	// Primitive resolver is a built-in.
	return nil, nil
}

// GenerateGoASTRef generates the Go statements to call the resolver.
func (r *primitiveResolver) GenerateGoASTRef() ([]gast.Stmt, error) {
	var stmts []gast.Stmt

	// valRef is the variable name of the value.
	// when dereferencing we build v1, v2, v3 etc.
	var valIndex int
	valRef := "v"

	// var v **myType
	// if v == nil { return resolver.BuildNullValue() }
	// v1 := *v
	// if v1 == nil { return resolver.BuildNullValue() } // etc...
	// }
	for i := 0; i < r.ptrDepth; i++ {
		// if {{valRef}} == nil
		stmts = append(stmts, &gast.IfStmt{
			Cond: &gast.BinaryExpr{
				Op: gtoken.EQL,
				X:  gast.NewIdent(valRef),
				Y:  gast.NewIdent("nil"),
			},

			// return resolver.BuildNullValue()
			Body: &gast.BlockStmt{
				Lbrace: gtoken.NoPos,
				Rbrace: gtoken.NoPos,
				List: []gast.Stmt{
					&gast.ReturnStmt{
						Results: []gast.Expr{
							&gast.CallExpr{
								Fun: &gast.SelectorExpr{
									X:   gast.NewIdent(resolverPkg),
									Sel: gast.NewIdent("BuildNullValue"),
								},
							},
						},
					},
				},
			},
		})

		// v1 := *v
		valIndex++
		nValRef := "v" + strconv.Itoa(valIndex)
		stmts = append(stmts, &gast.AssignStmt{
			// Assign the dereferenced value to a new variable
			Lhs: []gast.Expr{
				gast.NewIdent(nValRef),
			},
			Tok: gtoken.DEFINE,
			// Dereference the variable.
			Rhs: []gast.Expr{
				&gast.StarExpr{
					X: gast.NewIdent(valRef),
				},
			},
		})
		valRef = nValRef
	}

	// If we have to cast the type of the variable, do so now.
	if r.convertTo != nil {
		valIndex++
		nValRef := "v" + strconv.Itoa(valIndex)
		// For int -> int32 conversion, check bounds
		if r.convertTo.Name() == "int32" {
			stmts = append(stmts,
				&gast.IfStmt{
					Cond: &gast.BinaryExpr{
						X: &gast.BinaryExpr{
							X:  gast.NewIdent(valRef),
							Op: gtoken.GTR,
							Y:  gast.NewIdent("math.MaxInt32"),
						},
						Op: gtoken.LOR,
						Y: &gast.BinaryExpr{
							X:  gast.NewIdent(valRef),
							Op: gtoken.LSS,
							Y:  gast.NewIdent("math.MinInt32"),
						},
					},
					Body: &gast.BlockStmt{
						List: []gast.Stmt{
							&gast.ExprStmt{
								X: &gast.CallExpr{
									Fun: &gast.SelectorExpr{
										X:   gast.NewIdent(resolverPkg),
										Sel: gast.NewIdent("ResolveValOverflowError"),
									},
									Args: []gast.Expr{
										gast.NewIdent("rctx"),
									},
								},
							},
							&gast.ReturnStmt{},
						},
					},
				},
			)
		}
		stmts = append(stmts, &gast.AssignStmt{
			Lhs: []gast.Expr{
				gast.NewIdent(nValRef),
			},
			Tok: gtoken.DEFINE,
			Rhs: []gast.Expr{
				&gast.CallExpr{
					Fun: &gast.ParenExpr{
						X: gast.NewIdent(r.convertTo.Name()),
					},
					Args: []gast.Expr{
						gast.NewIdent(valRef),
					},
				},
			},
		})
		valRef = nValRef
	}

	// Construct the inner value resolution function
	// Map primitive type -> BuildIntValue, BuildStringValue, etc
	buildValFn := resolver.GetPrimValueFuncName(r.primKind)
	if buildValFn == "" {
		return nil, errors.Errorf("unrecognized primitive kind: %v", r.primKind)
	}

	var buildValArgs []gast.Expr
	if r.primKind != proto.RGQLPrimitive_PRIMITIVE_KIND_NULL {
		buildValArgs = []gast.Expr{gast.NewIdent(valRef)}
	}
	buildValFunc := &gast.FuncLit{
		Type: &gast.FuncType{
			Func:   gtoken.NoPos,
			Params: nil,
			// returns (*resolver.Value)
			Results: &gast.FieldList{
				List: []*gast.Field{
					{
						Type: &gast.StarExpr{
							X: &gast.SelectorExpr{
								X: &gast.Ident{
									Name: "resolver",
								},
								Sel: &gast.Ident{
									Name: "Value",
								},
							},
						},
					},
				},
			},
		},
		Body: &gast.BlockStmt{
			List: []gast.Stmt{
				&gast.ReturnStmt{
					Results: []gast.Expr{
						&gast.CallExpr{
							Fun: &gast.SelectorExpr{
								X:   gast.NewIdent(resolverPkg),
								Sel: gast.NewIdent(buildValFn),
							},
							Args: buildValArgs,
						},
					},
				},
			},
		},
	}

	// Construct the outer function call.
	stmts = append(stmts, &gast.ExprStmt{
		X: &gast.CallExpr{
			Fun: &gast.SelectorExpr{
				X: &gast.Ident{
					Name: resolverPkg,
				},
				Sel: &gast.Ident{
					Name: "ResolveValue",
				},
			},
			Args: []gast.Expr{
				// Resolver context argument.
				&gast.Ident{
					Name: "rctx",
				},
				// Indicate true/false if the value is final.
				&gast.Ident{
					Name: "true",
				},
				buildValFunc,
			},
		},
	})
	return stmts, nil
}

var _ Resolver = ((*primitiveResolver)(nil))

// buildPrimitiveResolver builds a resolver to resolve a primitive value.
func (rt *modelBuilder) buildPrimitiveResolver(value gtypes.Type, gtyp *ast.Named) (Resolver, error) {
	// Check if we have a channel.
	// We can nest channels (<-chan <-chan <-chan <-chan string for example) as much as we want.
	// The system will create a value tree leaf for each level, and communicate changes to the client.
	valueUt := value.Underlying()
	var ptrDepth int

	// Check primitives match
	// var basicTyp *gtypes.Basic
BasicTypLoop:
	for { // for basicTyp == nil {
		switch vut := valueUt.(type) {
		case *gtypes.Basic:
			// basicTyp = vut
			break BasicTypLoop
		case *gtypes.Pointer:
			ptrDepth++
			valueUt = vut.Elem()
		case *gtypes.Named:
			valueUt = vut.Underlying()
		case *gtypes.Chan:
			return rt.buildChanValueResolver(vut, gtyp)
			// return nil, errors.New("channel resolution unimplemented")
		default:
			return nil, errors.Errorf("unexpected non-primitive: %#v", vut)
		}
	}

	/*
		expectedKind, ok := gqlast.GraphQLPrimitivesKinds[gtyp.Name.Value]
		if !ok {
			return nil, errors.New("not a primitive")
		}
	*/

	expectedType, ok := gqlast.GraphQLPrimitivesTypes[gtyp.Name.Value]
	if !ok {
		return nil, errors.New("not a primitive")
	}

	expectedPrimKind, ok := types.GraphQLPrimitivesProtoKinds[gtyp.Name.Value]
	if !ok {
		return nil, errors.New("not a primitive supported by the protocol")
	}

	// var convertTo gtypes.Type
	/*
		if bkind := basicTyp.Kind(); expectedKind != bkind {
			expectedStr := gqlast.GoBasicKindStrings[expectedKind]
			actualStr := gqlast.GoBasicKindStrings[bkind]
			return nil, fmt.Errorf(
				"expected %v (or similar), got %v (%s)",
				expectedStr,
				actualStr,
				value.String(),
			)
		}
	*/

	var convertTo gtypes.Object
	if !gtypes.AssignableTo(valueUt, expectedType.Type()) {
		if gtypes.ConvertibleTo(valueUt, expectedType.Type()) {
			convertTo = expectedType
		} else {
			return nil, errors.Errorf(
				"cannot convert %s to %s",
				valueUt.String(),
				expectedType.Type().String(),
			)
		}
	}

	return &primitiveResolver{
		ptrDepth:  ptrDepth,
		convertTo: convertTo,
		primKind:  expectedPrimKind,
	}, nil
}
