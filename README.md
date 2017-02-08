# Magellan

Magellan is a **Realtime GraphQL** implementation for **Go**. Magellan:

 - Uses any two-way communication channel with clients (like a WebSocket).
 - Accepts a query with streaming updates and produces a stream of result data.
 - Enables live updates of data over time.
 - Efficiently encodes data into a packed binary representation with Protobuf.

The central protocol can be found in the [rgraphql](https://github.com/rgraphql/rgraphql) repository.

rGraphQL in practice allows your apps to efficiently request the exact set of data from an API required at any given time, stream live updates to that data, and simplifies API calling patterns drastically.

Protocol/Transports
===================

It's up to you to define how your Magellan server communicates with clients. Magellan will pass messages intended for the client to your code, which should then be relayed to the client.

All messages in the protocol are written in [Protobuf](https://github.com/rgraphql/rgraphql/blob/master/src/rgraphql.proto). You could use [proto.Marshal](https://godoc.org/github.com/golang/protobuf/proto#Marshal) to serialize the messages to binary, or [json.Marshal](https://golang.org/pkg/encoding/json/#Marshal) to JSON.

Getting Started
===============

Magellan uses [graphql-go](https://github.com/graphql-go/graphql) to parse your schema under the hood. You can use [magellan.NewServer](https://godoc.org/github.com/rgraphql/magellan#NewServer), [magellan.FromSchema](https://godoc.org/github.com/rgraphql/magellan#FromSchema), or [magellan.ParseSchema](https://godoc.org/github.com/rgraphql/magellan#ParseSchema) to build a schema and server, depending on your use case.

A simple example and demo can be found under [./example/simple](./example/simple).

Clients
=======

Magellan requires a [rGraphQL](https://github.com/rgraphql/rgraphql) capable client, like [Soyuz](https://github.com/rgraphql/soyuz). It currently cannot be used like a standard GraphQL server, although this is planned in the future.

Implementation
==============

Magellan builds results by executing resolver functions, which return data for a single field in the incoming query. Each type in the GraphQL schema must have a resolver function for each of its fields. The signature of these resolvers determines how Magellan treats the returned data.

Queries in Magellan are not one-off. Fields can return streams of data over time, which creates a mechanism for live-updating results. This requires a two-way communication channel between the client and server, which is provided by the user of the library (that's you!). One possible implementation could consist of a WebSocket between a browser and server.

The schema / resolver mechanisms are extremely modular. Magellan resolvers can take any form required by the user, and accept a variety of approaches to returning data.

## Resolvers

All resolvers can optionally take a `context.Context` as an argument. Without this argument, the system will consider the resolver as being "trivial." All streaming / live resolvers MUST take a Context argument, as this is the only way for the system to kill a long-running operation.

Note that ordering of arguments in your resolver functions does not matter. You can put the context first or the arguments first, etc.

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

You can also return a `[]<-chan string`, for example. The system will treat each array element as a live-updating field. Closing a channel will delete an array element. Sending a value over a channel will set the value of that array element. You could also return a `<-chan (<-chan string)` to get the same effect with an unknown number of array elements. The number of possible return types is infinite - the system builds a execution model unique to your schema.
