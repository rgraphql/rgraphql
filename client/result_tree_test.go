package client

import (
	"testing"

	"github.com/davecgh/go-spew/spew"
	"github.com/graphql-go/graphql/language/ast"
	"github.com/graphql-go/graphql/language/parser"
	"github.com/rgraphql/magellan/schema"
	"github.com/rgraphql/magellan/types"
	proto "github.com/rgraphql/rgraphql"
)

func buildTestSchema(t *testing.T) *schema.Schema {
	scm, err := schema.Parse(`
	type Person {
		name: String
		height: Int
	}

	type RootQuery {
		allPeople: [Person]
		names: [String]
		person(name: String): Person!
	}

	schema {
		query: RootQuery
	}
	`)
	if err != nil {
		t.Fatal(err.Error())
	}
	return scm
}

// TestSimpleApply is a basic preliminary test of the result tree.
func TestSimpleApply(t *testing.T) {
	scm := buildTestSchema(t)

	pdoc, err := parser.Parse(parser.ParseParams{
		Source: `
		query {
			person(name: "Christian") {
				name
			}
		}
		query {
			person(name: "Charlie") {
				name
			}
		}
		`,
	})
	if err != nil {
		t.Fatal(err.Error())
	}

	qtree, err := NewQueryTree(scm, nil)
	if err != nil {
		t.Fatal(err.Error())
	}

	query, err := NewQuery(pdoc.Definitions[0].(*ast.OperationDefinition))
	if err != nil {
		t.Fatal(err.Error())
	}

	err = qtree.Attach(query)
	if err != nil {
		t.Fatal(err.Error())
	}

	rtree, err := NewResultTree(qtree, proto.RGQLValueInit_CACHE_LRU, 30)
	if err != nil {
		t.Fatal(err.Error())
	}

	vals := []*proto.RGQLValue{
		{QueryNodeId: 1},
		{ArrayIndex: 1},
		{PosIdentifier: 1, QueryNodeId: 2, Value: types.NewStringPrimitive("hello world")},
		{PosIdentifier: 1, Value: types.NewStringPrimitive("goodbye")},
	}
	for vali, val := range vals {
		if err := rtree.HandleValue(val); err != nil {
			t.Fatalf("val[%d]: %s", vali, err.Error())
		}
	}

	t.Logf("applied %d mutations", len(vals))
	spew.Dump(rtree.root)
	// t.Logf("output: %#v", rtree.root)
}
