package client

import (
	"testing"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/graphql-go/graphql/language/parser"
	"github.com/rgraphql/magellan/types"
	proto "github.com/rgraphql/rgraphql"
)

// TestJsonDecoder is a basic preliminary test of the json decoder.
func TestJsonDecoder(t *testing.T) {
	scm := buildTestSchema(t)

	pdoc, err := parser.Parse(parser.ParseParams{
		Source: `
		query {
			person(name: "Christian") {
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

	jdec := NewJSONDecoder(qtree)
	rtree.AddResultHandler(jdec.GetResultHandler())

	vals := []*proto.RGQLValue{
		{QueryNodeId: 1},
		{ArrayIndex: 1},
		{QueryNodeId: 2},
		{Value: types.NewStringPrimitive("hello world")},
	}
	for vali, val := range vals {
		if err := rtree.HandleValue(val); err != nil {
			t.Fatalf("val[%d]: %s", vali, err.Error())
		}
	}

	t.Logf("applied %d mutations", len(vals))
}
