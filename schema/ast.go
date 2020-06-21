package schema

import (
	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/types"
)

type namedAstNode interface {
	GetName() *ast.Name
}

// ASTParts classifies parts of a GraphQL schema.
type ASTParts struct {
	Types            map[string]ast.TypeDefinition
	Objects          map[string]*ast.ObjectDefinition
	Enums            map[string]*ast.EnumDefinition
	Unions           map[string]*ast.UnionDefinition
	SchemaOperations map[string]*ast.OperationTypeDefinition
	AllNamed         map[string]ast.Node

	Schemas []*ast.SchemaDefinition

	RootQuery *ast.ObjectDefinition
}

func (ap *ASTParts) ApplyIntrospection() {
	rqd := ap.RootQuery
	if rqd == nil {
		return
	}

	found := false
	for _, field := range rqd.Fields {
		if field.Name.Value == "__schema" {
			found = true
			break
		}
	}

	if !found {
		rqd.Fields = append(rqd.Fields, &ast.FieldDefinition{
			Kind: "FieldDefinition",
			Name: &ast.Name{
				Kind:  "Name",
				Value: "__schema",
			},
			Type: &ast.Named{
				Kind: "Named",
				Name: &ast.Name{Kind: "Name", Value: "__Schema"},
			},
		})
	}

	if _, ok := ap.AllNamed["__Schema"]; ok {
		return
	}

	for name, prim := range types.GraphQLPrimitivesAST {
		ap.AllNamed[name] = prim
		ap.Types[name] = prim
	}

	ap.Apply(introspectionAst)
}

// Apply merges two ASTParts together. Rarely used.
func (ap *ASTParts) Apply(other *ASTParts) {
	for name, typ := range other.AllNamed {
		ap.AllNamed[name] = typ
		if td, ok := typ.(*ast.EnumDefinition); ok {
			ap.Enums[name] = td
		}
		if od, ok := typ.(*ast.ObjectDefinition); ok {
			ap.Objects[name] = od
		}
		if ud, ok := typ.(*ast.UnionDefinition); ok {
			ap.Unions[name] = ud
		}
		if td, ok := typ.(ast.TypeDefinition); ok {
			ap.Types[name] = td
		}
	}
}

// LookupType finds what the GraphQL type `typ` is pointing to.
func (ap *ASTParts) LookupType(typ ast.Type) (atd ast.TypeDefinition) {
	if nn, ok := typ.(*ast.NonNull); ok {
		return ap.LookupType(nn.Type)
	}

	switch t := typ.(type) {
	case *ast.Named:
		if t.Name == nil || t.Name.Value == "" {
			return nil
		}
		atd, _ := ap.Types[t.Name.Value]
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
		Enums:            make(map[string]*ast.EnumDefinition),
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
		case *ast.EnumDefinition:
			if tdef.Name == nil || tdef.Name.Value == "" {
				break
			}
			pts.Types[tdef.Name.Value] = tdef
			pts.Enums[tdef.Name.Value] = tdef
		}
		if nm, ok := def.(namedAstNode); ok {
			name := nm.GetName()
			if name != nil {
				pts.AllNamed[name.Value] = def
			}
		}
	}
	if rqop, ok := pts.SchemaOperations["query"]; ok {
		rq := pts.LookupType(rqop.Type)
		if rq != nil {
			pts.RootQuery = rq.(*ast.ObjectDefinition)
		}
	}
	return pts
}
