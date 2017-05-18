The standard usage of this library should look like:

 - Parse schema, build/validate resolver tree
 - Create a client using that schema.
 - That client maintains context (remote query tree, etc).
 - Call `client.HandleMessage(message)` and have a channel for outgoing messages.
 - Use a context for each client.
 - Server maintains a query tree, in sync with the client-side tree.
 - Server should control starting/stopping resolvers when necessary.
 - This can be achieved with a server-side value (resolver) tree.

Execution Model
===============

The "execution model" is built by traversing a set of Go types that should directly correspond to the GraphQL schema (otherwise leading to an error). The tree builds a structured pairing between AST definitions and resolvers.

At runtime, these resolver executors are responsible for managing the flow of data through the user's resolver code. They execute resolver functions, build contexts, push results back to the client code, handle communication of resolver start/stop events and errors, etc.

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

Result Encoding Algorithm
=========================

This section describes the result encoding algorithm, an important optimization.

When resolving a result, there are often elements that are "trivial" to resolve:

```go
func (r *MyResolver) Id() uint32 {
  return r.Id
}
```

It's easy to know these are trivial, because they have no `context.Context` argument, and return no errors.

If we have a lot of trivial fields as is common in JSON objects like this:

```json
{
  "id": 1,
  "name": "John",
  "age": 8
}
```

It does not make sense to send back each field as a separate message. In this case,
you would end up with four messages to send back a trivial amount of data. Instead it makes sense to send back all the fields in a single message. It's not always this easy, though, since we want the values to make their way to the client as soon as possible without delay. We also want to avoid overflowing the client with too much memory usage maintaining a shared position identifier table. These objectives are the driving factors behind the following algorithm design.

When a new field value is found, it is written to the output along with a path representing where it is located in the result. Traditionally, such a stream of data would look like this:

```json
{"path": ["users", 0, "name"], "value": "\"John\""}
{"path": ["users", 0, "age"], "value": "4"}
```

In Real-Time GraphQL, we often have fields resolved at different times. This means that it's important to find a way to efficiently transmit values located in different places in the tree, without repeating the "path" portion of the message every time, as this would introduce a significant bandwidth overhead.

Because the client and server share a common query tree with each field labeled with a query-node ID (a variable-length integer), these paths are already quite a bit more efficient to encode than with using JSON:

```json
{"path": [0, 0, 0], "value": "John"}
{"path": [0, 0, 1], "value": 4}
```

To avoid repeating paths, the system uses "path aliasing" and a shared alias cache between the server and client. The system predicts if a part of the path will be referenced again in the future by a variety of factors. If so, an identifier is assigned to that point in the path. This is done by representing each value as a series of list entries. The path is split into one object per location in the path, with the following scheme:

```proto
message RGQLValue {
  // If we're in an object, the field identifier in the query tree.
  uint32 qnode_id = 1;
  // If we're in an array, the index, 1-indexed.
  uint32 index = 2;
  // If we're a 0-th index value, this is a pointer to a previous identifier.
  // Otherwise, this is an identifier labeling this position for future use.
  // Identifiers start at 1.
  uint32 pos_identifier = 3;
  // The value, if we have one.
  RGQLPrimitive value = 4;
}
```

The client and server maintain a least-recently-used cache for these position identifiers, with a tunable value for the cache size. Value messages are batched using a maximum message size.

Here are a few examples, where each message is expressed as an array of field values.

 - `qnode_id` appears at index `0`, `index` at index `1`, etc
 - A number prefixed by `~` indicates a message containing only a `pos_identifier`.

```plain
{"test": 1}
[0, 0, 1]

{"items": [{"price": 1, "name": "test"}]}
[0], [0, 1, 1], [0, 0, 0, 1]
[~1], [1, 0, 0, "test"]

{
  "test": [[{"hello": ["there"], "id": 1}]],
  "test2": {"description": "test", "id": 1}
}
[0], [0, 1], [0, 1, 1], [0], [0, 1, 0, "there"]
[~1], [1, 0, 0, 1]
[1], [0, 0, 0, "test"], [1], [1, 0, 0, 1]
```

In the last example, the alias `[~1]` eliminates the need to repeat the sequence `[0], [0, 1], [0, 1]`. Aliases can point to locations in the path, or even to field values themselves.

## When to alias?

Aliases should be assigned in the following circumstances:

 - A object contains non-live child primitive fields that remain to be resolved.
 - A field is live, and will receive further updates.
 - An array has more entries.

Obviously, performance degrades when we assign too many position identifiers. The above algorithm can be improved in the future.

## What about empty arrays?

Here is an example of how an empty array is represented:

```json
{"person": {"children": []}}
[0], [0, 0, 0, kind:array]

{"person": {"children": null}}
[0], [0, 0, 0, kind:null]
```

In this case the system recognizes an empty array `val=[]` as a distinct value from a null array `val=null`. Generally arrays are inferred when the first element is referenced in the array. In this case, a separate message must be sent to ensure that the array is seen on the client.
