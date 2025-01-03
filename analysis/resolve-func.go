package analysis

import (
	"fmt"
	gast "go/ast"
	"go/token"
	gtoken "go/token"
	gtypes "go/types"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/pkg/errors"
	"github.com/rgraphql/rgraphql/types/gqlast"
	"github.com/rgraphql/rgraphql/util"
)

type funcArgField struct {
	fieldName string
	isPtr     bool
	convertTo gtypes.Type
}

type funcResolver struct {
	// result resolver
	resultResolver Resolver
	// fieldName is the field name on the go type
	fieldName string

	// index of context argument
	contextArg int
	// index of arguments argument
	argsArg int
	// type of arguments argument
	argsType gtypes.Type
	// argsIsPtr indicates the arguments field is a pointer.
	argsIsPtr bool
	// argsFields contains the fields to fill in on the argument.
	argsFields map[string]funcArgField
	// index of output channel argument
	outputChanArg int
	// outputType is the type of the output value
	outputType gtypes.Type
	// outputIsList indicates the output is an array.
	outputIsList bool
	// has an error returned
	returnsError bool
}

// GetName returns the function resolver name.
func (r *funcResolver) GetName() string {
	return ""
}

// GenerateGoASTDecls generates Go declarations to fulfill the resolver.
func (r *funcResolver) GenerateGoASTDecls() ([]gast.Decl, error) {
	// Eventually get to:
	// v := theValue
	// {{valueResolver}} -> resolver.ResolveValue(rctx, true, func() *resolver.Value etc...
	return nil, nil
}

const (
	outChRef       = "outCh"
	rctxRef        = "rctx"
	vctxRef        = "vctx"
	errChRef       = "errCh"
	ctxRef         = "ctx"
	argsRef        = "rargs"
	resolverObjRef = "r"
	resultIndexRef = "ri"
	argVarRef      = "argVar"
)

// GenerateGoASTRef generates the Go statements to call the resolver.
func (r *funcResolver) GenerateGoASTRef() ([]gast.Stmt, error) {
	// Determine the function call format.
	// result, err := r.MyField(ctx, args, outCh)
	// result, err, ctx, args, and outCh are all optional.
	funcParams := r.generateFuncParams()

	// Generate the result resolver statements.
	resolveResultStmts, err := r.resultResolver.GenerateGoASTRef()
	if err != nil {
		return nil, err
	}

	// Generate the resolver function call signature.
	// r.MyField(ctx, args, outCh)
	resolverCallExprArgs := make([]gast.Expr, len(funcParams))
	resolverCallExpr := &gast.CallExpr{
		Fun: &gast.SelectorExpr{
			X:   gast.NewIdent(resolverObjRef),
			Sel: gast.NewIdent(r.fieldName),
		},
		Args: resolverCallExprArgs,
	}
	for i, arg := range funcParams {
		resolverCallExprArgs[i] = arg.value
	}

	var stmts []gast.Stmt
	// Generate the arguments object if necessary.
	if r.argsArg != 0 {
		argsStmts, err := r.generateArgsConstructor()
		if err != nil {
			return nil, err
		}

		stmts = append(stmts, argsStmts...)
	}

	// ctx := rctx.Context
	if r.contextArg != 0 {
		// ctx := rctx.Context
		stmts = append(stmts, &gast.AssignStmt{
			Lhs: []gast.Expr{
				gast.NewIdent(ctxRef),
			},
			Tok: gtoken.DEFINE,
			Rhs: []gast.Expr{
				&gast.SelectorExpr{
					X:   gast.NewIdent(rctxRef),
					Sel: gast.NewIdent("Context"),
				},
			},
		})

		if !r.outputIsList {
			// Create a sub-context for this value.
			// var vctx *resolver.Context
			stmts = append(stmts, &gast.DeclStmt{
				Decl: &gast.GenDecl{
					Tok: token.VAR,
					Specs: []gast.Spec{
						&gast.ValueSpec{
							Names: []*gast.Ident{
								gast.NewIdent("vctx"),
							},
							Type: &gast.StarExpr{
								X: &gast.SelectorExpr{
									X:   gast.NewIdent("resolver"),
									Sel: gast.NewIdent("Context"),
								},
							},
						},
					},
				},
			})
		}
	}

	// outCh := make(chan outputValue)
	// errCh := make(chan error, 1)
	// go func() { errCh <- r.ResolveField(ctx, ...) }
	if r.outputChanArg != 0 {
		stmtSet, err := r.generateOutputChanProcessor(
			resolverCallExpr,
			resolveResultStmts,
		)
		if err != nil {
			return nil, err
		}
		stmts = append(stmts, stmtSet...)
	} else {
		lhs := []gast.Expr{gast.NewIdent("v")}
		if r.returnsError {
			lhs = append(lhs, gast.NewIdent("err"))
		}
		stmts = append(stmts, &gast.AssignStmt{
			Lhs: lhs,
			Tok: gtoken.DEFINE,
			Rhs: []gast.Expr{
				resolverCallExpr,
			},
		})
		if r.returnsError {
			stmts = append(stmts, &gast.IfStmt{
				Cond: &gast.BinaryExpr{
					X:  gast.NewIdent("err"),
					Op: gtoken.NEQ,
					Y:  gast.NewIdent("nil"),
				},
				Body: &gast.BlockStmt{
					List: []gast.Stmt{
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
			})
		}

		stmts = append(stmts, resolveResultStmts...)
	}

	return stmts, nil
}

var _ Resolver = ((*funcResolver)(nil))

// buildFuncResolver builds a function that resolves a value from a function signature.
func (rt *modelBuilder) buildFuncResolver(
	f *gtypes.Func,
	fieldt *ast.FieldDefinition,
) (Resolver, error) {
	var outputType gtypes.Type

	funcSignature := f.Type().(*gtypes.Signature)
	funcArgs := funcSignature.Params()
	funcArgsCount := funcArgs.Len()

	res := &funcResolver{
		fieldName: f.Name(),
	}
	for i := 0; i < funcArgsCount; i++ {
		funcArg := funcArgs.At(i)
		funcArgType := funcArg.Type()
		funcArgNamed, _ := funcArgType.(*gtypes.Named)
		funcArgPtr, _ := funcArgType.(*gtypes.Pointer)
		funcArgCh, _ := funcArgType.(*gtypes.Chan)

		var funcArgUnderlying gtypes.Type
		var funcArgUnderlyingStruct *gtypes.Struct
		if funcArgPtr != nil {
			funcArgUnderlying = funcArgPtr.Elem().Underlying()
			funcArgUnderlyingStruct, _ = funcArgUnderlying.(*gtypes.Struct)
		} else {
			funcArgUnderlyingStruct, _ = funcArgType.Underlying().(*gtypes.Struct)
		}

		// Handle ctx context.Context argument.
		isContext := res.contextArg == 0 &&
			funcArgNamed != nil &&
			funcArgNamed.Obj().Pkg().Path() == "context" &&
			funcArgNamed.Obj().Name() == "Context"
		if isContext {
			res.contextArg = i + 1
			continue
		}

		// Struct argument.
		isArgs := res.argsArg == 0 &&
			funcArgUnderlyingStruct != nil
		if isArgs {
			res.argsFields = make(map[string]funcArgField)
			for _, arg := range fieldt.Arguments {
				fieldExportedName := util.ToPascalCase(arg.Name.Value)
				argType, ok := arg.Type.(*ast.Named)
				if !ok {
					return nil, errors.Errorf(
						"unexpected graphql ast arg type %s",
						arg.Type.String(),
					)
				}

				var fieldConvertTo gtypes.Type
				fieldFound := false
				for fi := 0; fi < funcArgUnderlyingStruct.NumFields(); fi++ {
					field := funcArgUnderlyingStruct.Field(fi)
					if field.Name() != fieldExportedName {
						continue
					}

					fieldFound = true
					fieldType := field.Type()
					fieldTypeUnder := fieldType.Underlying()
					primKind := gqlast.GraphQLPrimitivesKinds[argType.Name.Value]
					primType := gqlast.GraphQLPrimitivesTypes[argType.Name.Value]
					underBasic, ok := fieldTypeUnder.(*gtypes.Basic)
					if !ok {
						return nil, errors.Errorf(
							"unexpected type %s for %s",
							fieldType.String(),
							argType.Name.Value,
						)
					}
					if underBasic.Kind() != primKind {
						if !gtypes.ConvertibleTo(fieldTypeUnder, primType.Type()) {
							return nil, errors.Errorf(
								"%s: %s: expected type %s (or similar) for %s, got %s",
								funcArgUnderlyingStruct.String(),
								field.Name(),
								gqlast.GoBasicKindStrings[primKind],
								argType.Name.Value,
								gqlast.GoBasicKindStrings[underBasic.Kind()],
							)
						}
						fieldConvertTo = primType.Type()
					}
				}

				if !fieldFound {
					return nil, errors.Errorf(
						"expected field %s on argument type %s",
						fieldExportedName,
						funcArgUnderlyingStruct.String(),
					)
				}

				res.argsFields[arg.Name.Value] = funcArgField{
					isPtr:     funcArgPtr != nil,
					fieldName: fieldExportedName,
					convertTo: fieldConvertTo,
				}
			}

			res.argsArg = i + 1
			res.argsType = funcArgType
			res.argsIsPtr = funcArgPtr != nil
			continue
		}

		isChannel := res.outputChanArg == 0 &&
			funcArgCh != nil
		if isChannel {
			if funcArgCh.Dir() != gtypes.SendOnly {
				return nil, errors.Errorf(
					"function argument %s: %s should be send-only: chan<-",
					funcArg.String(),
					funcArgCh.String(),
				)
			}

			outputType = funcArgCh.Elem()
			res.outputChanArg = i + 1
			continue
		}

		return nil, errors.Errorf(
			"function argument %s unrecognized",
			funcArg.String(),
		)
	}

	funcResults := funcSignature.Results()
	funcResultsCount := funcResults.Len()

	// If we have a channel output, expect 1 return (error)
	if res.outputChanArg > 0 {
		if res.contextArg == 0 {
			return nil, errors.Errorf(
				"function %s: expected context argument when using channel output",
				funcSignature.String(),
			)
		}

		res.returnsError = funcResultsCount != 0
		if res.returnsError &&
			(funcResultsCount != 1 || !isErrorType(funcResults.At(0).Type())) {
			return nil, errors.Errorf(
				"function %s: expected single error return value when using channel output",
				funcSignature.String(),
			)
		}
	} else {
		rerr := func() error {
			return errors.Errorf(
				"function %s: expected (result, error) or (result) return values",
				funcSignature.String(),
			)
		}
		if funcResultsCount == 1 {
			if isErrorType(funcResults.At(0).Type()) {
				return nil, rerr()
			}
		} else if funcResultsCount != 2 ||
			!isErrorType(funcResults.At(1).Type()) ||
			isErrorType(funcResults.At(0).Type()) {
			return nil, rerr()
		} else {
			res.returnsError = true
		}
		outputType = funcResults.At(0).Type()
	}

	// Build executor for the function result.
	resultType := fieldt.Type
	var fieldTypeList *ast.List
	fieldTypeList, res.outputIsList = resultType.(*ast.List)
	// TODO: refactor awkward slice handling
	if res.outputIsList && res.outputChanArg != 0 {
		resultType = fieldTypeList.Type
		/*
			outputSliceType, ok := outputType.(*gtypes.Slice)
			if ok {
				outputType = outputSliceType.Elem()
			}
		*/
	}

	// Follow the pointer.
	outputTypeElem := outputType
	if otPtr, ok := outputType.(*gtypes.Pointer); ok {
		outputTypeElem = otPtr.Elem()
	}

	resultResolver, err := rt.buildResolver(typeResolverPair{
		ASTType:      resultType,
		ResolverType: outputTypeElem,
	})
	if err != nil {
		return nil, errors.Wrap(err, "build result resolver")
	}
	res.resultResolver = resultResolver
	res.outputType = outputType
	// res.resultType = outputType

	return res, nil // errors.Errorf("not implemented: call %s -> %#v", f.String(), funcSignature.String())
}

// isErrorType checks if the type is an error.
func isErrorType(typ gtypes.Type) bool {
	return typ.String() == "error"
}

// Find a resolver function for a field.
func findResolverFunc(resolverType gtypes.Type, fieldName string) (*gtypes.Func, error) {
	namedType, ok := resolverType.(*gtypes.Named)
	if !ok {
		return nil, errors.Errorf("expected named type, got %#v", resolverType)
	}

	fieldNamePascal := util.ToPascalCase(fieldName)
	fieldNameGet := fmt.Sprintf("Get%s", fieldNamePascal)
	for mi := 0; mi < namedType.NumMethods(); mi++ {
		mf := namedType.Method(mi)
		if mf.Name() == fieldNamePascal || mf.Name() == fieldNameGet {
			return mf, nil
		}
	}
	return nil, errors.Errorf(
		"cannot find resolver for %s on %s - expected func %s or %s",
		fieldName, resolverType.String(), fieldNamePascal, fieldNameGet,
	)

	/*
		if t, ok := resolverType.(*gtypes.Named); ok {
			resolverType = resolverType.Underlying()
		}

		var resolverPtr *gtypes.Pointer
		var resolverStruct *gtypes.Struct
		var ok bool
		if resolverStruct, ok = resolverType.(*gtypes.Struct); ok {
			resolverPtr = gtypes.NewPointer(resolverStruct)
		} else if resolverPtr, ok = resolverType.(*gtypes.Pointer); !ok {
			return nil, errors.Errorf("expected struct or pointer, got %#v", resolverType)
		} else {
			if resolverStruct, ok = resolverPtr.Elem().Underlying().(*gtypes.Struct); !ok {
				return nil, errors.Errorf("expected struct pointer, got %#v", resolverType)
			}
		}

		return nil, nil
	*/
}
