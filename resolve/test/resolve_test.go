package resolve_test

import (
	"context"
	"encoding/json"
	"errors"
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

/* Query is:
allPeople {
	name
}
*/

type RootQueryResolver struct{}

func (*RootQueryResolver) AllPeople(ctx context.Context) []*PersonResolver {
	return []*PersonResolver{{errorOut: true}, {}}
}

type PersonResolver struct {
	errorOut bool
}

func (r *PersonResolver) Name() (*string, error) {
	res := "Tiny"
	if r.errorOut {
		return nil, errors.New("This is a resolver error.")
	}
	return &res, nil
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
		if ni > 8 {
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
	time.Sleep(time.Duration(2) * time.Second)
	fmt.Printf("Adding steps to the query...\n")
	qt.ApplyTreeMutation(&proto.RGQLTreeMutation{
		NodeMutation: []*proto.RGQLTreeMutation_NodeMutation{
			{
				NodeId:    1,
				Operation: proto.RGQLTreeMutation_SUBTREE_ADD_CHILD,
				Node: &proto.RGQLQueryTreeNode{
					Id:        3,
					FieldName: "steps",
				},
			},
		},
	})
	time.Sleep(time.Duration(3) * time.Second)
	fmt.Printf("Removing steps from the query...\n")
	qt.ApplyTreeMutation(&proto.RGQLTreeMutation{
		NodeMutation: []*proto.RGQLTreeMutation_NodeMutation{
			{
				NodeId:    3,
				Operation: proto.RGQLTreeMutation_SUBTREE_DELETE,
			},
		},
	})
	time.Sleep(time.Duration(3) * time.Second)
	fmt.Printf("Removing entire query...\n")
	qt.ApplyTreeMutation(&proto.RGQLTreeMutation{
		NodeMutation: []*proto.RGQLTreeMutation_NodeMutation{
			{
				NodeId:    1,
				Operation: proto.RGQLTreeMutation_SUBTREE_DELETE,
			},
		},
	})
	time.Sleep(time.Duration(3) * time.Second)
}
