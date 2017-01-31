package schema

import (
	"github.com/graphql-go/graphql/language/ast"
	// "github.com/graphql-go/graphql/language/parser"
)

type ASTParts struct {
	Types            map[string]ast.TypeDefinition
	Objects          map[string]*ast.ObjectDefinition
	Unions           map[string]*ast.UnionDefinition
	Schemas          []*ast.SchemaDefinition
	SchemaOperations map[string]*ast.OperationTypeDefinition
}

// Merge two ASTParts together.
func (ap *ASTParts) Apply(other *ASTParts) {
	for name, typ := range other.Types {
		ap.Types[name] = typ
		if od, ok := typ.(*ast.ObjectDefinition); ok {
			ap.Objects[name] = od
		}
		if ud, ok := typ.(*ast.UnionDefinition); ok {
			ap.Unions[name] = ud
		}
	}
}

// LookupType finds what the GraphQL type `typ` is pointing to.
func (ap *ASTParts) LookupType(typ ast.Type) ast.TypeDefinition {
	switch t := typ.(type) {
	case *ast.Named:
		if t.Name == nil || t.Name.Value == "" {
			return nil
		}
		return ap.Types[t.Name.Value]
	case ast.TypeDefinition:
		return t
	case *ast.List:
		return ap.LookupType(t.Type)
	default:
		return nil
	}
}

func DocumentToParts(doc *ast.Document) *ASTParts {
	pts := &ASTParts{
		Types:            make(map[string]ast.TypeDefinition),
		Objects:          make(map[string]*ast.ObjectDefinition),
		Unions:           make(map[string]*ast.UnionDefinition),
		SchemaOperations: make(map[string]*ast.OperationTypeDefinition),
	}
	for _, def := range doc.Definitions {
		switch tdef := def.(type) {
		case *ast.SchemaDefinition:
			pts.Schemas = append(pts.Schemas, tdef)
			for _, opdef := range tdef.OperationTypes {
				pts.SchemaOperations[opdef.Operation] = opdef
			}
		case *ast.UnionDefinition:
			if tdef.Name == nil || tdef.Name.Value == "" {
				break
			}
			pts.Types[tdef.Name.Value] = tdef
			pts.Unions[tdef.Name.Value] = tdef
		case *ast.ObjectDefinition:
			if tdef.Name == nil || tdef.Name.Value == "" {
				break
			}
			pts.Types[tdef.Name.Value] = tdef
			pts.Objects[tdef.Name.Value] = tdef
		}
	}
	return pts
}
