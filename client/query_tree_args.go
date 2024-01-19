package client

import (
	"github.com/graphql-go/graphql/language/ast"
	proto "github.com/rgraphql/rgraphql"
	"github.com/rgraphql/rgraphql/types"
	"github.com/rgraphql/rgraphql/varstore"
)

// argsMap is the flattened arguments map.
type argsMap map[string]*varstore.VariableReference

// newArgsMapFromAst builds a new flattened arguments map from AST.
// Non-variable values
func newArgsMapFromAst(varStore *varstore.VariableStore, args []*ast.Argument) (argsMap, error) {
	if len(args) == 0 {
		return nil, nil
	}

	m := make(argsMap, len(args))
	for _, arg := range args {
		if arg.Name == nil {
			continue
		}

		argVal, err := types.NewASTPrimitive(arg.Value)
		if err != nil {
			return nil, err
		}

		m[arg.Name.Value] = varStore.GetOrPutWithValue(argVal)
	}

	return m, nil
}

// BuildProto constructs the field arguments.
func (m argsMap) BuildProto() (pargs []*proto.FieldArgument) {
	for argName, argRef := range m {
		pargs = append(pargs, &proto.FieldArgument{
			Name:       argName,
			VariableId: argRef.GetVarID(),
		})
	}
	return
}

// Equals compares the two argument maps for equality.
func (m argsMap) Equals(other argsMap) bool {
	if m == nil && other == nil {
		return true
	}

	if len(m) != len(other) {
		return false
	}

	if m == nil || other == nil {
		return false
	}

	for k, ref := range m {
		ov, ovOk := other[k]
		if !ovOk {
			return false
		}

		if !types.IsPrimEquiv(ov.GetValue(), ref.GetValue()) {
			return false
		}
	}

	return true
}
