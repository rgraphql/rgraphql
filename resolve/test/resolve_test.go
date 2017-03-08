package resolve_test

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/rgraphql/magellan/qtree"
	"github.com/rgraphql/magellan/schema"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
	"testing"
)

var schemaSrc string = `
type Person {
	name: String
	steps: Int
	parents: [String]
}

type RootMutation {
	addPerson(name: String): Person
}

type RootQuery {
	allPeople: [Person]
}

schema {
	query: RootQuery
	mutation: RootMutation
}
`

/* Query is:
allPeople {
	name
}
*/

type RootQueryResolver struct{}

func (*RootQueryResolver) AllPeople(ctx context.Context) []*PersonResolver {
	return []*PersonResolver{{}, {}}
}

type RootMutationResolver struct{}

func (r *RootMutationResolver) AddPerson(args *struct{ Name string }) *StaticPersonResolver {
	return &StaticPersonResolver{
		name: args.Name,
	}
}

type StaticPersonResolver struct {
	name string
}

func (sp *StaticPersonResolver) GetName() string {
	return sp.name
}

func (r *StaticPersonResolver) GetSteps() uint16 {
	return 0
}

func (r *StaticPersonResolver) GetParents() []string {
	return nil
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

// Return a chan of channels. Live queries! Update array elements.
func (r *PersonResolver) Parents() <-chan <-chan string {
	outp := make(chan (<-chan string), 5)
	res := []string{
		"Jim",
		"Tom",
		"Bill",
	}
	for _, e := range res {
		name := e
		och := make(chan string, 1)
		och <- e
		outp <- och
		go func() {
			time.Sleep(time.Duration(1) * time.Second)
			och <- (name + " Later!")
		}()
	}
	return outp
}

func buildMockTree(t *testing.T, addChildren bool, isMutation bool) (*schema.Schema, *qtree.QueryTreeNode) {
	sch, err := schema.Parse(schemaSrc)
	if err != nil {
		t.Fatal(err.Error())
	}
	sendCh := make(chan *proto.RGQLQueryError, 1)
	qt, err := sch.BuildQueryTree(sendCh, isMutation)
	if err != nil {
		t.Fatal(err.Error())
	}
	if addChildren {
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
					FieldName: "parents",
				},
			},
		})
		if err != nil {
			t.Fatal(err.Error())
		}
	}
	return sch, qt
}

func TestBasics(t *testing.T) {
	schema, qt := buildMockTree(t, true, false)
	rqr := &RootQueryResolver{}
	rmr := &RootMutationResolver{}
	if err := schema.SetResolvers(rqr, rmr); err != nil {
		t.Fatal(err.Error())
	}
	fmt.Printf("Executing...\n")
	q := schema.StartQuery(context.Background(), qt, false)
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
					Id:        4,
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
				NodeId:    4,
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
	q.Cancel()
	q.Wait()
}

func TestMutation(t *testing.T) {
	schema, qt := buildMockTree(t, false, true)
	rqr := &RootQueryResolver{}
	rmr := &RootMutationResolver{}
	if err := schema.SetResolvers(rqr, rmr); err != nil {
		t.Fatal(err.Error())
	}
	fmt.Printf("Executing mutation...\n")
	qt.ApplyTreeMutation(&proto.RGQLTreeMutation{
		Variables: []*proto.ASTVariable{
			{
				Id:        0,
				JsonValue: `"Testy"`,
			},
		},
		NodeMutation: []*proto.RGQLTreeMutation_NodeMutation{
			{
				NodeId:    0,
				Operation: proto.RGQLTreeMutation_SUBTREE_ADD_CHILD,
				Node: &proto.RGQLQueryTreeNode{
					Id:        1,
					FieldName: "addPerson",
					Args: []*proto.FieldArgument{
						{
							Name:       "name",
							VariableId: 0,
						},
					},
					Children: []*proto.RGQLQueryTreeNode{
						{
							Id:        1,
							FieldName: "name",
						},
					},
				},
			},
		},
	})
	exc := schema.StartMutation(context.Background(), qt)
	result, err := exc.Wait()
	if err != nil {
		t.Fatal(err.Error())
	}
	bin, err := json.Marshal(result)
	if err != nil {
		t.Fatal(err.Error())
	}
	t.Log(string(bin))
}
