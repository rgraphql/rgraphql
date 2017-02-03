package qtree

import (
	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/schema"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
	"testing"
)

var schemaSrc string = `
type Planet {
	name: String
	radius: Int
}

type Person {
	name: String
	height: Int
	home: Planet
}

type RootQuery {
	allPeople: [Person]
}

schema {
	query: RootQuery
}
`

func buildMockTree(t *testing.T) (*schema.Schema, *QueryTreeNode) {
	sch, err := schema.Parse(schemaSrc)
	if err != nil {
		t.Fatal(err.Error())
	}
	rootQ := sch.Definitions.AllNamed["RootQuery"].(*ast.ObjectDefinition)
	qt := NewQueryTree(rootQ, sch.Definitions)
	return sch, qt
}

func TestBasics(t *testing.T) {
	_, qt := buildMockTree(t)
	err := qt.AddChild(&proto.RGQLQueryTreeNode{
		Id:        1,
		FieldName: "allPeople",
		Children: []*proto.RGQLQueryTreeNode{
			{
				Id:        2,
				FieldName: "name",
			},
		},
	})
	if err != nil {
		t.Fatal(err.Error())
	}
	t.Logf("%#v", qt.Children[0])
}

func TestSchemaErrors(t *testing.T) {
	_, qt := buildMockTree(t)
	err := qt.AddChild(&proto.RGQLQueryTreeNode{
		Id:        1,
		FieldName: "allPeople",
		Children: []*proto.RGQLQueryTreeNode{
			{
				Id:        2,
				FieldName: "names",
			},
		},
	})
	if err == nil || err.Error() != "Invalid field names on Person." {
		t.Fatalf("Did not return expected error (%v).", err)
	}
}
