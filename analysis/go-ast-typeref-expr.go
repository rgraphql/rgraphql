package analysis

import (
	gast "go/ast"
	gtypes "go/types"

	"github.com/pkg/errors"
)

// buildGoTypeReferenceExpr builds a expression referencing a type.
// make({{buildGoTypeReferenceExpr(myType)}})
// -> make(mypackage.MyType) etc.
func buildGoTypeReferenceExpr(typ gtypes.Type) (gast.Expr, error) {
	switch t := typ.(type) {
	case *gtypes.Chan:
		subExpr, err := buildGoTypeReferenceExpr(t.Elem())
		if err != nil {
			return nil, err
		}
		return &gast.ChanType{
			Value: subExpr,
			// Dir:   t.D,
		}, nil
	case *gtypes.Basic:
		return gast.NewIdent(t.String()), nil
	case *gtypes.Named:
		tObj := t.Obj()
		tName := tObj.Name()
		pkg := tObj.Pkg()
		if pkg != nil {
			return &gast.SelectorExpr{
				X:   gast.NewIdent(pkg.Name()),
				Sel: gast.NewIdent(tName),
			}, nil
		}
		return gast.NewIdent(tName), nil
	case *gtypes.Pointer:
		subExpr, err := buildGoTypeReferenceExpr(t.Elem())
		if err != nil {
			return nil, err
		}
		return &gast.StarExpr{
			X: subExpr,
		}, nil
	default:
		return nil, errors.Errorf("unknown go type to expr: %#v", t)
	}
}
