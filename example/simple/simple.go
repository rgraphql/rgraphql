package main

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	pb "github.com/golang/protobuf/proto"
	"github.com/rgraphql/magellan"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

// schemaSrc is our GraphQL schema.
var schemaSrc string = `
type Person {
  name: String
  age: Int
  steps: Int
  parents: [String]
  favoriteMonths: [String]
}

type RootQuery {
  person(name: String): Person
  allPeople: [Person]
}

schema {
  query: RootQuery
}
`

// RootQueryResolver resolves the RootQuery fields.
type RootQueryResolver struct{}

// AllPeople resolves the allPeople query on RootQuery.
func (r *RootQueryResolver) AllPeople() []*PersonResolver {
	return []*PersonResolver{
		{name: "Jane"},
		//{name: "Bill"},
		//{name: "John"},
	}
}

// Person resolves a specific person via the person field on RootQuery.
func (r *RootQueryResolver) Person(args *struct{ Name string }) *PersonResolver {
	if args == nil || args.Name == "" {
		return nil
	}
	return &PersonResolver{name: args.Name}
}

// PersonResolver resolves fields on a particular Person.
type PersonResolver struct {
	name string
}

// Name resolves the person's name.
func (r *PersonResolver) Name() string {
	return r.name
}

func (r *PersonResolver) Parents() []string {
	return []string{
		"Parent1",
		"Parent2",
		"Parent3",
	}
}

func (r *PersonResolver) FavoriteMonths(ctx context.Context) <-chan string {
	ch := make(chan string)
	result := []string{
		"January",
		"March",
		"August",
		"December",
	}
	go func() {
		for _, res := range result {
			select {
			case ch <- res:
			case <-ctx.Done():
				return
			}
		}
	}()
	return ch
}

func (r *PersonResolver) Age() int {
	return 5
}

func (r *PersonResolver) Steps(ctx context.Context, out chan<- int) error {
	sc := 0
	for {
		select {
		case <-ctx.Done():
			return nil
		case out <- sc:
		}

		select {
		case <-ctx.Done():
			return nil
		case <-time.After(time.Duration(1) * time.Second):
			sc++
		}
	}
}

func main() {
	fmt.Printf("Parsing schema and building execution model...\n")
	server, err := magellan.ParseSchema(schemaSrc, &RootQueryResolver{}, nil)
	if err != nil {
		panic(err)
	}

	// You could pass your own client connection context instead of Background here.
	// When this context is canceled, the client will be terminated and all of the
	// query resolvers will be canceled / stopped automatically.
	fmt.Printf("Building client...\n")
	clientCtx, clientCtxCancel := context.WithCancel(context.Background())
	sendCh := make(chan *proto.RGQLServerMessage)
	go func() {
		for msg := range sendCh {
			{
				dat, _ := pb.Marshal(msg)
				fmt.Printf("[%d bytes encoded] ", len(dat))
				dat, _ = json.Marshal(msg)
				fmt.Printf("%s\n", string(dat))
			}
			if msg.ValueBatch != nil {
				for _, val := range msg.ValueBatch.Values {
					m := &proto.RGQLValue{}
					pb.Unmarshal(val, m)
					dat, _ := json.Marshal(m)
					fmt.Printf(" -> %s\n", string(dat))
				}
			}
		}
	}()

	qresolver := &RootQueryResolver{}
	client, err := server.BuildClient(clientCtx, sendCh, qresolver, nil)
	if err != nil {
		panic(err)
	}

	fmt.Printf("Building query...\n")
	queryId := uint32(1)
	client.HandleMessage(&proto.RGQLClientMessage{
		InitQuery: &proto.RGQLQueryInit{
			QueryId:       queryId,
			OperationType: "query",
		},
	})

	fmt.Printf("Query built. Currently, it is empty: {}\n\n")
	time.Sleep(time.Duration(1) * time.Second)

	// You would now pass messages to client.HandleMessage.
	// These messages would come from a client, like Soyuz.
	// For the sake of this demo, let's make some example mutations.

	/* Our first mutation creates this query:
	 * {
	 *   allPeople {
	 *     name
	 *     age
	 *     parents
	 *   }
	 * }
	 *
	 * This is done by sending a message that says, roughly:
	 * "Add `allPeople { name }` as a child of the root query."
	 */
	fmt.Printf("\nAdding allPeople { name, age, steps, parents }:\n\n")
	client.HandleMessage(&proto.RGQLClientMessage{
		MutateTree: &proto.RGQLQueryTreeMutation{
			QueryId: queryId,
			NodeMutation: []*proto.RGQLQueryTreeMutation_NodeMutation{
				{
					// The root query node is always ID 0.
					NodeId: 0,
					// We want to add a child query node.
					Operation: proto.RGQLQueryTreeMutation_SUBTREE_ADD_CHILD,
					// The actual node / tree we want to add.
					Node: &proto.RGQLQueryTreeNode{
						Id:        1,
						FieldName: "allPeople",
						Children: []*proto.RGQLQueryTreeNode{
							// The contents of person(...) { name }: name
							{
								Id:        2,
								FieldName: "name",
							},
							{
								Id:        3,
								FieldName: "age",
							},
							{
								Id:        4,
								FieldName: "parents",
							},
							{
								Id:        5,
								FieldName: "favoriteMonths",
							},
						},
					},
				},
			},
		},
	})

	time.Sleep(time.Duration(5) * time.Second)

	fmt.Printf("\nRemoving the allPeople { name } part of the query:\n\n")
	client.HandleMessage(&proto.RGQLClientMessage{
		MutateTree: &proto.RGQLQueryTreeMutation{
			QueryId: queryId,
			NodeMutation: []*proto.RGQLQueryTreeMutation_NodeMutation{
				{
					// Just specify the node ID we gave when adding the query part.
					NodeId:    1,
					Operation: proto.RGQLQueryTreeMutation_SUBTREE_DELETE,
				},
			},
		},
	})

	time.Sleep(time.Duration(2) * time.Second)
	fmt.Printf("\nCanceling query and waiting for resolvers to exit...\n")

	clientCtxCancel()
	// client.Wait() - not implemented
}
