package client

import (
	"encoding/json"
	"testing"

	"github.com/graphql-go/graphql/language/ast"
	"github.com/graphql-go/graphql/language/parser"
	proto "github.com/rgraphql/rgraphql"
)

type chQtHandler struct {
	outCh chan<- *proto.RGQLQueryTreeMutation
}

// HandleMutation handles a query tree mutation.
func (q *chQtHandler) HandleMutation(mut *proto.RGQLQueryTreeMutation) {
	q.outCh <- mut
}

// TestAttachDetachQuery tests attaching/detaching a query to a query tree.
func TestAttachDetachQuery(t *testing.T) {
	scm := buildTestSchema(t)
	pdoc, err := parser.Parse(parser.ParseParams{
		Source: `
		query {
			names
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

	mutCh := make(chan *proto.RGQLQueryTreeMutation, 10)
	qth := &chQtHandler{outCh: mutCh}
	qtree, err := NewQueryTree(scm, qth)
	if err != nil {
		t.Fatal(err.Error())
	}

	def := pdoc.Definitions[0]
	query, err := NewQuery(def.(*ast.OperationDefinition))
	if err != nil {
		t.Fatal(err.Error())
	}
	if err := qtree.Attach(query); err != nil {
		t.Fatal(err.Error())
	}

	if len(qtree.root.children) != 2 {
		t.Fatalf("expected %d got %d children", 2, len(qtree.root.children))
	}

	def = pdoc.Definitions[1]
	queryb, err := NewQuery(def.(*ast.OperationDefinition))
	if err != nil {
		t.Fatal(err.Error())
	}
	if err := qtree.Attach(queryb); err != nil {
		t.Fatal(err.Error())
	}

	if len(qtree.root.children) != 3 {
		t.Fatalf("expected %d got %d children", 3, len(qtree.root.children))
	}

	def = pdoc.Definitions[0]
	queryc, err := NewQuery(def.(*ast.OperationDefinition))
	if err != nil {
		t.Fatal(err.Error())
	}
	if err := qtree.Attach(queryc); err != nil {
		t.Fatal(err.Error())
	}
	if len(qtree.root.children) != 3 {
		t.Fatalf("expected %d got %d children", 3, len(qtree.root.children))
	}

	if err := qtree.Detach(queryb); err != nil {
		t.Fatal(err.Error())
	}

	if len(qtree.root.children) != 2 {
		t.Fatalf("expected %d got %d children", 2, len(qtree.root.children))
	}

	var mutCount int
MutLoop:
	for {
		select {
		case mut := <-mutCh:
			d, _ := json.Marshal(mut)
			t.Logf("Mutation: %s\n", string(d))
			mutCount++
		default:
			break MutLoop
		}
	}

	if mutCount != 3 {
		t.Fatal("expected 3 mutations: 2 add, 1 del")
	}
}
