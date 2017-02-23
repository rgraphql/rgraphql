package main

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/rgraphql/magellan"
	proto "github.com/rgraphql/rgraphql/pkg/proto"
)

// schemaSrc is our GraphQL schema.
var schemaSrc string = `
type Person {
  name: String
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
		{name: "Bill"},
		{name: "John"},
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

func main() {
	server, err := magellan.ParseSchema(schemaSrc, &RootQueryResolver{}, nil)
	if err != nil {
		panic(err)
	}

	// You could pass your own client connection context instead of Background here.
	// When this context is canceled, the client will be terminated and all of the
	// query resolvers will be canceled / stopped automatically.
	clientCtx, clientCtxCancel := context.WithCancel(context.Background())
	sendCh := make(chan *proto.RGQLServerMessage)
	go func() {
		for msg := range sendCh {
			dat, _ := json.Marshal(msg)
			fmt.Printf("%s\n", string(dat))
		}
	}()

	client, err := server.BuildClient(clientCtx, sendCh)
	if err != nil {
		panic(err)
	}

	fmt.Printf("Client built. Currently, the query is empty: {}\n\n")
	time.Sleep(time.Duration(1) * time.Second)

	// You would now pass messages to client.HandleMessage.
	// These messages would come from a client, like Soyuz.
	// For the sake of this demo, let's make some example mutations.

	/* Our first mutation creates this query:
	 * {
	 *   allPeople {
	 *     name
	 *   }
	 * }
	 *
	 * This is done by sending a message that says, roughly:
	 * "Add `allPeople { name }` as a child of the root query."
	 */
	fmt.Printf("Let's add allPeople { name } to the query:\n\n")
	client.HandleMessage(&proto.RGQLClientMessage{
		MutateTree: &proto.RGQLTreeMutation{
			NodeMutation: []*proto.RGQLTreeMutation_NodeMutation{
				{
					// The root query node is always ID 0.
					NodeId: 0,
					// We want to add a child query node.
					Operation: proto.RGQLTreeMutation_SUBTREE_ADD_CHILD,
					// The actual node / tree we want to add.
					Node: &proto.RGQLQueryTreeNode{
						// Increment to ID 1. The server will use this ID for reference,
						// when it sends back data later.
						Id:        1,
						FieldName: "allPeople",
						// Children of allPeople { }
						Children: []*proto.RGQLQueryTreeNode{
							// The contents of allPeople { }: name
							{
								// Increment ID by 1
								Id: 2,
								// name
								FieldName: "name",
							},
						},
					},
				},
			},
		},
	})

	// As of now, we will see output on the termianl.
	time.Sleep(time.Duration(3) * time.Second)

	fmt.Printf("\nNow, let's add person(name: \"Jerry\") { name }:\n\n")
	client.HandleMessage(&proto.RGQLClientMessage{
		MutateTree: &proto.RGQLTreeMutation{
			Variables: []*proto.ASTVariable{
				{
					Id:        1,
					JsonValue: "\"Jerry\"",
				},
			},
			NodeMutation: []*proto.RGQLTreeMutation_NodeMutation{
				{
					// The root query node is always ID 0.
					NodeId: 0,
					// We want to add a child query node.
					Operation: proto.RGQLTreeMutation_SUBTREE_ADD_CHILD,
					// The actual node / tree we want to add.
					Node: &proto.RGQLQueryTreeNode{
						// Increment to ID 3, ID just needs to be unused.
						Id:        3,
						FieldName: "person",
						// Arguments
						Args: []*proto.FieldArgument{
							{
								// Name of the argument
								Name: "name",
								// In Magellan / Soyuz we optimize by deduplicating argument values.
								// We send the value for this argument as a variable.
								VariableId: 1,
							},
						},
						// Children of person { }
						Children: []*proto.RGQLQueryTreeNode{
							// The contents of person(...) { name }: name
							{
								Id:        4,
								FieldName: "name",
							},
						},
					},
				},
			},
		},
	})

	time.Sleep(time.Duration(2) * time.Second)

	fmt.Printf("\nRemoving the allPeople { name } part of the query:\n\n")
	client.HandleMessage(&proto.RGQLClientMessage{
		MutateTree: &proto.RGQLTreeMutation{
			NodeMutation: []*proto.RGQLTreeMutation_NodeMutation{
				{
					// Just specify the node ID we gave when adding the query part.
					NodeId:    1,
					Operation: proto.RGQLTreeMutation_SUBTREE_DELETE,
				},
			},
		},
	})

	time.Sleep(time.Duration(2) * time.Second)
	fmt.Printf("\nCanceling query and waiting for resolvers to exit...\n")

	clientCtxCancel()
	client.Wait()
}
