# Magellan

[![GoDoc Widget]][GoDoc] [![Go Report Card Widget]][Go Report Card]

> Two-way streaming GraphQL over real-time transports (WebSockets).

## Introduction

Magellan is a **Real-time Streaming GraphQL** implementation for Go. It:

 - Uses any two-way communication channel with clients (e.x. **WebSockets**).
 - Analyzes Go code to automatically generate resolver code fitting a schema.
 - Streams real-time updates to both the request and response.
 - Efficiently packs data on the wire with Protobuf.
 - Simplifies writing resolver functions with a flexible and intuitive API surface.
 - Accepts standard GraphQL queries and produces real-time output.
 
**rGraphQL*** protocol allows your apps to efficiently request the exact set of
data from an API required at any given time, encode that data in an efficient
format for transport, and stream live updates to the result.

**Magellan*** is a lightweight, concurrent, code-generation based GraphQL engine
and protocol for Golang, with a client [Soyuz] written in TypeScript and
designed for React-like interfaces.

The Magellan analyzer loads a GraphQL schema and a Go code package. It then
"fits" the GraphQL schema to the Go code, generating more Go "resolver" code.
The resolver code links the application with Magellan.

At runtime, the client specifies a stream of modifications to a single global
GraphQL query. The client merges together query fragments from UI components,
and informs the server of changes to this query as components are mounted and
unmounted. The server starts and stops resolvers to produce the requested data,
and delivers a binary-packed stream of encoded response data, using a highly
optimized protocol. The client re-constructs the result object and provides it
to the frontend code, similar to other GraphQL clients.

The current supported client is the [Soyuz] TypeScript client.

Magellan is currently in pre-release (prototype) state.

An older reflection-based implementation of this project is available in the
"reflect" branch.

[Soyuz](https://github.com/rgraphql/soyuz)

## Getting Started

Magellan uses [graphql-go] to parse your schema under the hood. 

Install the **magellan** command-line tool:

```bash
cd ~
export GO111MODULE=on
go get -v github.com/rgraphql/magellan/cmd/magellan@master
magellan -h
```

Write a simple schema file `schema.graphql`:

```graphql
# RootQuery is the root query object.
type RootQuery {
  counter: Int
}

schema {
    query: RootQuery
}
```

Write a simple resolver file `resolve.go`:

```go
// RootResolver resolves RootQuery
type RootResolver struct {}

// GetCounter returns the counter value.
func (r *RootResolver) GetCounter(ctx context.Context, outCh chan<- int) {
	var v int
	for {
		select {
		case <-ctx.Done():
			return
		case <-time.After(time.Second):
			v++
			outCh <- v
		}
	}
}
```

The compiler is go-modules aware, so you can pass it package import paths
directly.

Magellan produces code in a `resolver_generated.go` file, in a separate package
`resolve`. It will produce resolvers for all reachable code for resolving your
schema. At runtime the resolvers are passed queries, and translate the queries
into calls against your resolver code.

To analyze the example code in this repo:

```bash
cd ./example/simple
go run github.com/rgraphql/magellan/cmd/magellan \
   analyze --schema ./schema.graphql \
   --go-pkg github.com/rgraphql/magellan/example/simple \
   --go-query-type RootResolver \
   --go-output ./resolve/resolve_generated.go
```

To test the code out:

```bash
go test -v github.com/rgraphql/magellan/example/simple/resolve
```

The basic usage of the code is as follows:

```go
// parse schema
mySchema, err := schema.Parse(schemaStr)
// build one query tree per client
queryTree, err := sch.BuildQueryTree(errCh)
errCh := make(chan *proto.RGQLQueryError, 10)

// the soyuz client generates a stream of commands like this:
qtNode.ApplyTreeMutation(&proto.RGQLQueryTreeMutation{
    NodeMutation: []*proto.RGQLQueryTreeMutation_NodeMutation{
        &proto.RGQLQueryTreeMutation_NodeMutation{
            NodeId:    0,
            Operation: proto.RGQLQueryTreeMutation_SUBTREE_ADD_CHILD,
            Node: &proto.RGQLQueryTreeNode{
                Id:        1,
                FieldName: "counter",
            },
        },
      },
  })

// results are encoded into a binary stream
encoder := encoder.NewResultEncoder(50)
outputCh := make(chan []byte)
doneCh := make(chan struct{})
go encoder.Run(ctx, outputCh)

// start up the resolvers
// rootRes is the type you provide for the root resolver.
rootRes := &simple.RootResolver{}
resolverCtx := resolver.NewContext(ctx, qtNode, encoder)

// ResolveRootQuery is a goroutine which calls your code 
// according to the ongoing queries, and formats the results
// into the encoder.
go ResolveRootQuery(resolverCtx, rootRes)
```

A simple example and demo can be found under [./example/simple/resolve.go].

[graphql-go](https://github.com/graphql-go/graphql)
[magellan.Server](https://godoc.org/github.com/rgraphql/magellan#Server)
[magellan.NewServer](https://godoc.org/github.com/rgraphql/magellan#NewServer)
[magellan.FromSchema](https://godoc.org/github.com/rgraphql/magellan#FromSchema)
[magellan.ParseSchema](https://godoc.org/github.com/rgraphql/magellan#ParseSchema)
[./example/simple/resolve.go](./example/simple/resolve.go)

## Clients

Magellan requires a [rGraphQL](https://github.com/rgraphql/rgraphql) capable
client, like [Soyuz](https://github.com/rgraphql/soyuz). It currently cannot be
used like a standard GraphQL server, although this is planned for the future.


## Protocol/Transports

It's up to you to define how your Magellan server communicates with clients.
Magellan will pass messages intended for the client to your code, which should
then be relayed to the client.

All messages in the protocol are written in
[Protobuf](https://github.com/rgraphql/rgraphql/blob/master/src/rgraphql.proto).
You could use
[proto.Marshal](https://godoc.org/github.com/golang/protobuf/proto#Marshal) to
serialize the messages to binary, or
[json.Marshal](https://golang.org/pkg/encoding/json/#Marshal) to JSON.

## Implementation

Magellan builds results by executing resolver functions, which return data for a
field in the incoming query. Each type in the GraphQL schema must have a
resolver function or field for each of its fields. The signature of these
resolvers determines how Magellan treats the returned data.

Fields can return streams of data over time, which creates a mechanism for
live-updating results. One possible implementation could consist of a WebSocket
between a browser and server.

## Resolvers

The analyzer tries to "fit" the schema to the functions you write. The order and
presence of the arguments, the result types, the presence or lack of channels,
can be whatever is necessary for your application.

All resolvers can optionally take a `context.Context` as an argument. Without
this argument, the system will consider the resolver as being "trivial." All
streaming / live resolvers MUST take a Context argument, as this is the only way
for the system to cancel a long-running operation.

Functions with a `Get` prefix - like `GetRegion() string` will also be
recognized by the system. This means that Protobuf types in Go will be handled
automatically.

Here are some examples of resolvers you might write.

### Basic Resolver Types

```go
// Return a string, non-nullable.
func (*PersonResolver) Name() string {
  return "Jerry"
}

// Return a string pointer, nullable.
// Lack of context argument indicates "trivial" resolver.
// Returning an error is optional for basic resolver types.
func (*PersonResolver) Name() (*string, error) {
	result := "Jerry"
	return &result, nil
}

// Arguments, inline type definition.
func (*PersonResolver) Name(ctx context.Context, args *struct{ FirstOnly bool }) (*string, error) {
  firstName := "Jerry"
  lastName := "Seinfeld"
  if args.FirstOnly {
    return &firstName, nil
  }
  fullName := fmt.Sprintf("%s %s", firstName, lastName)
  return &fullName, nil
}

type NameArgs struct {
  FirstOnly bool
}

// Arguments, named type.
func (*PersonResolver) Name(ctx context.Context, args *NameArgs) (*string, error) {
  // same as last example.
}
```

### Array Resolvers

There are several ways to return an array of items.

```go
// Return a slice of strings. Non-null: nil slice = 0 entries.
func (r *SentenceResolver) Words() ([]string, error) {
  return []string{"test", "works"}, nil
}

// Return a slice of strings. Nullable: nil pointer = null, nil slice = []
func (r *SentenceResolver) Words() (*[]string, error) {
  result := []string{"test", "works"}
  return &result, nil
  // or: return nil, nil
}

// Return a slice of resolvers.
func (r *PersonResolver) Friends() (*[]*PersonResolver, error) {
  result := []*PersonResolver{&PersonResolver{}, nil}
  return &result, nil
}

// Return a channel of strings.
// Closing the channel marks it as done.
// If the context is canceled, the system ignores anything put in the chan.
func (r *PersonResolver) Friends() (<-chan string, error) {
  result := []*PersonResolver{&PersonResolver{}, nil}
  return &result, nil
}
```

### Streaming Basic Resolvers

To implement "live" resolvers, we take the following function structure:

```go
// Change a person's name over time.
// Returning from the function marks the resolver as complete.
// Streaming resovers must return a single error object.
// Returning from the resolver function indicates the resolver is complete.
// Closing the result channel is OK but the resolver should return soon after.
func (r *PersonResolver) Name(ctx context.Context, args *struct{ FirstOnly bool }, resultChan chan<- string) error {
  done := ctx.Done()
  i := 0
  for {
    i += 1
    nextName := "Tom "+i
    select {
    case <-done:
      return nil
    case resultChan<-nextName:
    }
    select {
    case <-done:
      return nil
    case time.After(time.Duration(1)*time.Second):
    }
  }
}
```

You can also return a `[]<-chan string`, for example. The system will treat each
array element as a live-updating field. Closing a channel will delete an array
element. Sending a value over a channel will set the value of that array
element. You could also return a `<-chan (<-chan string)` to get the same effect
with an unknown number of array elements. 


## Developing

Magellan is an ongoing work in progress, so please feel free to help out, file
issues, usability improvements, and/or PRs. Thanks!

