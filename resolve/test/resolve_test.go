package resolve_test

import (
	"context"
	"encoding/json"
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
	steps: Int
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

func (r *PersonResolver) Steps(ctx context.Context, output chan<- int) error {
	done := ctx.Done()
	ni := 0
	for {
		ni++
		select {
		case <-done:
			return nil
		case output <- ni:
		}
		if ni > 4 {
			close(output)
			return nil
		}
		time.Sleep(time.Duration(500) * time.Millisecond)
	}
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
			{
				Id:        3,
				FieldName: "steps",
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
	q := schema.StartQuery(context.Background(), qt)
	_ = q
	go func() {
		msgs := q.Messages()
		for msg := range msgs {
			dat, _ := json.Marshal(msg)
			fmt.Printf("%s\n", string(dat))
		}
	}()
	// q.Wait()
	// Hold it open for now
	time.Sleep(time.Duration(30) * time.Minute)
}
