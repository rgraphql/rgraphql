package schema

import (
	"github.com/graphql-go/graphql/language/ast"
)

type namedAstNode interface {
	GetName() *ast.Name
}

// ASTParts classifies parts of a GraphQL schema.
type ASTParts struct {
	Types            map[string]ast.TypeDefinition
	Objects          map[string]*ast.ObjectDefinition
	Unions           map[string]*ast.UnionDefinition
	Schemas          []*ast.SchemaDefinition
	SchemaOperations map[string]*ast.OperationTypeDefinition
	AllNamed         map[string]ast.Node

	RootQuery    ast.TypeDefinition
	RootMutation ast.TypeDefinition
}

// Apply merges two ASTParts together.
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
	if nn, ok := typ.(*ast.NonNull); ok {
		return ap.LookupType(nn.Type)
	}
	switch t := typ.(type) {
	case *ast.Named:
		if t.Name == nil || t.Name.Value == "" {
			return nil
		}
		atd, _ := ap.AllNamed[t.Name.Value].(ast.TypeDefinition)
		return atd
	case ast.TypeDefinition:
		return t
	case *ast.List:
		return ap.LookupType(t.Type)
	default:
		return nil
	}
}

// DocumentToParts classifies the parts of a ast.Document in an AstParts
func DocumentToParts(doc *ast.Document) *ASTParts {
	pts := &ASTParts{
		Types:            make(map[string]ast.TypeDefinition),
		Objects:          make(map[string]*ast.ObjectDefinition),
		Unions:           make(map[string]*ast.UnionDefinition),
		SchemaOperations: make(map[string]*ast.OperationTypeDefinition),
		AllNamed:         make(map[string]ast.Node),
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
		if nm, ok := def.(namedAstNode); ok {
			name := nm.GetName()
			if name != nil {
				pts.AllNamed[name.Value] = def
			}
		}
	}
	if rqop, ok := pts.SchemaOperations["query"]; ok {
		pts.RootQuery = pts.LookupType(rqop.Type)
	}
	if rqop, ok := pts.SchemaOperations["mutation"]; ok {
		pts.RootMutation = pts.LookupType(rqop.Type)
	}
	return pts
}
