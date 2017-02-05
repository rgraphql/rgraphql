package resolve_test

import (
	"context"
	"fmt"
	"time"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/rgraphql/magellan/qtree"
	"github.com/rgraphql/magellan/schema"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
	"testing"
)

var schemaSrc string = `
type Person {
	name: String
}

type RootQuery {
	allPeople: [Person]
}

schema {
	query: RootQuery
}
`

type RootQueryResolver struct{}

func (*RootQueryResolver) AllPeople(ctx context.Context) []*PersonResolver {
	return []*PersonResolver{{}, {}}
}

type PersonResolver struct{}

func (r *PersonResolver) Name() *string {
	res := "Tiny"
	return &res
}

func buildMockTree(t *testing.T) (*schema.Schema, *qtree.QueryTreeNode) {
	sch, err := schema.Parse(schemaSrc)
	if err != nil {
		t.Fatal(err.Error())
	}
	rootQ := sch.Definitions.AllNamed["RootQuery"].(*ast.ObjectDefinition)
	qt := qtree.NewQueryTree(rootQ, sch.Definitions)
	err = qt.AddChild(&proto.RGQLQueryTreeNode{
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
	return sch, qt
}

func TestBasics(t *testing.T) {
	schema, qt := buildMockTree(t)
	rqr := &RootQueryResolver{}
	if err := schema.SetResolvers(rqr); err != nil {
		t.Fatal(err.Error())
	}
	fmt.Printf("Executing...\n")
	schema.StartQuery(context.Background(), qt)
	fmt.Printf("Sleeping...\n")
	time.Sleep(time.Duration(5) * time.Second)
}
