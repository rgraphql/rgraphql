The standard usage of this library should look like:

 - Parse schema, build/validate resolver tree
 - Create a client using that schema.
 - That client maintains context (remote query tree, etc).
 - Call `client.HandleMessage(message)` and have a channel for outgoing messages.
 - Use a context for each client.
 - Server maintains a query tree, in sync with the client-side tree.
 - Server should control starting/stopping resolvers when necessary.
 - This can be achieved with a server-side value (resolver) tree.

Resolver Tree
=============

The "resolver tree" is built by traversing a set of Go types that should directly correspond to the GraphQL schema (otherwise leading to an error). The tree builds a structured pairing between AST definitions and resolvers.

At runtime, these resolver executors are responsible for managing the flow of data in and out of the user's resolver code. They execute resolver functions, build contexts, push results back to the client code, handle communication of resolver start/stop events and errors, etc.

When we want to actually call resolvers at runtime, we build a pairing between query tree nodes (fields) and resolver executors.

Resolver Executors
==================

If we have a root resolver like so:

```graphql
type RootQuery {
  people: [Person]!
}

type Person {
  name: String
}
```

```go
type RootQueryResolver struct {}

func (q *RootQueryResolver) People() []*PersonResolver {
  return []*PersonResolver{&PersonResolver{}}
}

type PersonResolver struct {}

func (pr *PersonResolver) Name() string {
  return "Tom"
}
```

The algorithm looks something like:

 - Observe `people` on AST `RootQuery`, look for `People` on Go resolver.
 - Check return type of `People`, verify it satisfies an array type.
 - Step into `Elem()` of the return of `People()`. Step into `Person` as well.
 - Repeat on new child.

Suppose we return an array of `interface{}` instead of `[]*PersonResolver`. When we attempt to step into `Elem()` of `People()` we will find that the `interface{}` does not satisfy the resolver functions required, and return an error.

We run into an issue when we have two different resolver types for the same thing:

```graphql
type Person {
  friends: [Person]!
}
```

```go
type PersonResolver struct {}

func (*PersonResolver) Friends() []*FriendResolver {
  return []*FriendResolver{&FriendResolver{}}
}

type FriendResolver struct {}

func (*FriendResolver) Friends() []*FriendResolver {
  return []*FriendResolver{&FriendResolver{}}
}
```

Two issues here: first, we have two different resolver types for `Person` (`PersonResolver` and `FriendResolver`), and `Friends()` on `FriendResolver` returns instances of itself, so it's infinitely recursive.

The solution is to keep a map of already parsed out resolver types. Then, point to those existing types instead of re-checking the type again.
