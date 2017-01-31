# Magellan - Streaming GraphQL Server

Magellan is the rGraphQL server implementation for Golang.

RealTime GraphQL is a different approach to GraphQL. If you're new to rGraphQL, see the project [documentation](https://github.com/rgraphql/rgraphql).

Parts of this project are based on work by @neelance from the [graphql-go](https://github.com/neelance/graphql-go) server implementation.

Magellan requires a [rGraphQL](https://github.com/rgraphql/rgraphql) capable client, like [Soyuz](https://github.com/rgraphql/soyuz). It currently cannot be used like a standard GraphQL server, although this is planned in the future.

Magellan builds results by executing resolver functions, which return data for a single field in the incoming query. Each type in the GraphQL schema must have a resolver function for each of its fields. The signature of these resolvers determines how Magellan treats the returned data.

Queries in Magellan are not one-off. Fields can return streams of data over time, which creates a mechanism for live-updating results. This requires a two-way communication channel between the client and server, which is provided by the user of the library (that's you!). One possible implementation could consist of a WebSocket between a browser and server.

## Resolvers

All resolvers can optionally take a `context.Context` as the first argument. Without this argument, the system will consider the resolver as being "trivial." All streaming / live resolvers MUST take a Context argument, as this is the only way for the system to kill a long-running operation.

Here are the types of resolvers you can use.

### Basic Resolver Types

```go
// Return a string, non-nullable.
func (*PersonResolver) Name() string {
  return "Jerry"
}

// Return a string pointer, nullable.
// Lack of context argument indicates "trivial" resolver.
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
