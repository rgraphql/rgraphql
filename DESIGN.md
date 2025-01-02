The standard usage of this library:

 - Use rgraphql tool to parse schema file, build/validate resolver tree
 - Generate query model code to fit provided query structures on client
 - Generate execution model code to fit the provided resolvers to the model on server
 - Construct a session instance for each remote client
 - Transport rgraphql messages over a reliable ordered channel

Open questions / TODOs:

 - In resolve_object.go, recognize when one of the fields finalizes and remove
   the purge func reference. Otherwise, this is a memory leak (a unnecessary
   reference remains to the child of the resolver tree and their contexts /
   context cancel funcs).
 - How do we handle array removals? How can I emit an object and remove it later?

Execution Model
===============

The "execution model" is built by traversing a set of Go types that should
directly correspond to the GraphQL schema (otherwise leading to an error). The
tree builds a structured pairing between AST definitions and resolvers.

At runtime, these resolver executors are responsible for managing the flow of
data through the user's resolver code. They execute resolver functions, build
contexts, push results back to the client code, handle communication of resolver
start/stop events and errors, etc.

When we want to actually call resolvers at runtime, we build a pairing between
query tree nodes (fields) and resolver executors.

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

Generated Resolvers
===================

At code generation time, the system tries to pair a GraphQL schema file (.graphql) with a given Go struct or interface as a root resolver.

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

The analyzer tool uses the Go tools to observe the Go source and manage imports. At a high level:

 - Load and compile the desired Go package (and dependencies) excluding generated code with a build flag
 - Use reflection to analyze the code (AST analysis is probably also possible)
 - Generate code that can be called by the execution engine to resolve query values
 - Query value calls emit channels of RGQLValue types (value wrapped with metadata)
 - Result encoder encodes stream of RGQLValue and context (result value path)

The output of the analyzer tool would be:

```bash
$ rgraphql analyze --schema=schema.graphql --pkg github.com/myorg/myproj/resolver --resolver RootQuery=RootQueryResolver
Compiling analysis package...
Executing analysis package...
Schema RootQuery [object] to Go type struct RootQueryResolver
    People is an array, binding to func People
Binding [Person] from schema to Go type []*PersonResolver
Binding Person from schema to Go type struct PersonResolver
    Name is a primitive, binding to func Name
        Binding String from schema to Go type string
```

The --type syntax indicates that the RootQuery GraphQL type should be bound to the RootQueryResolver Go type.

The internal representation looks like:

```
RootQuery -> struct RootQueryResolver
    People (ID 1) -> func People() []*PersonResolver
[Person] -> func People() []*PersonResolver
    Call func, if return nil then [], etc.
[Person] -> []*PersonResolver
    Resolve as array, with values following *PersonResolver
Person -> *PersonResolver
    Check if nil, if nil then return null
    Name (ID 2) -> func Name() string
String -> func Name() string
    Call func, resolve result
String -> string
    Return primitive as value
```

Given a Go type and a GraphQL type, the system understands how to process the value at runtime and either execute another resolver, or yield a final result.

Therefore, the fundamental information we are building is a mapping between a particular GraphQL schema type (Object) and a runtime object (struct).

The generated resolvers are passed the query tree node reference, a reference to the resolver context, 

```go
// For root type:
// type RootQuery {
//   names: [string]!
//   people: [Person]!
// }
// type Person {}
type RootResolver struct {}

// Names returns a list of names.
func (r *RootResolver) Names() []string {
  return []string{"Larry", "Laurant"}
}

// People returns a slice of person.
func (r *RootResolver) People() []*PersonResolver {
  return []*PersonResolver{
    &PersonResolver{},
  }
}

func ResolveRootQuery(rctx *resolver.Context, qnode *qtree.QueryNode, r *RootResolver) {
  rootQueryFieldMap := map[uint32]resolver.FieldResolver{
    // Field name maps directly to resolver
    "names": func(rctx *resolver.Context, qnode *qtree.QueryNode) {
      v := r.Names()

      // ResolveValueSlice iterates over the slice
      // Each function call returns a resolver.Value at index
      // This value is emitted at the array index i.
      resolvers.ResolveValueSlice(len(v), func(i int) *resolver.Value {
        // NewStringValue builds a *resolver.Value with a string primitive.
        return resolver.NewStringValue(v[i])
      })
    },
    "people": func(rctx *resolver.Context, qnode *qtree.QueryNode) {
      v := r.People()
      resolvers.ResolveSlice(len(v), func(ictx *resolver.Context, i int) {
        ResolvePerson(ictx, qnode, v[i])
      })
    },
  } 

  // Execute the standard object resolver
  // This pays attention to the qnode fields
  // And executes the above functions based on field hash
  resolvers.ResolveObject(rctx, qnode, rootQueryFieldMap)
}

// Resolver functions always have func(*resolver.Context, *qtree.QueryNode)
```

We have a rule: no reflection at runtime. Limits:

 - Cannot return interface{} because we can't follow that ref.

rgraphql:

 - Build resolvers that are passed interface{} recursively, use type assertions to assert things at runtime.
 - Use a ResolverContext to keep track of the current path, if it's an array, etc etc and generate result stream.
 - ClientInstance is created for each session, then clients can initQuery() to start a new query namespace
 - Root resolver is executed with a handle to the RootQuery qtree node, which subscribes to changes to qtree node children.
 - Resolve() function is always passed a qtree handle (resolver context) and a Go value (struct pointer, etc etc.)

So, how does this translate to generated Go code?

 - A separate package is generated that contains the entire execution model for the code (not along-side the original code)
 - Generated code imports code that watches the qnode children list and starts/stops children resolvers
 - Resolver functions are normalized to always write to a stream of RGQLNode
 - Therefore, we need to generate a map from hash of field name -> bind to Go value with a resolver function in a goroutine

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

## Client-side Query Tree (Go)

The query tree on the client side is built my merging together query fragments into a single query tree.

A query fragment might look like (given the above example schema):

```graphql
query {
  allPeople {
    name
  }
}
```

The Query object is constructed with the above query, and is validated against the schema.

When attaching this query to the query tree, the tree is locked. Next, the system walks the query and the corresponding schema components in sync, creating query tree nodes for any new leaves of the query. Reference counts for each of the relevant nodes are incremented, and the new nodes are written to the QueryTreeHandler (usually implemented by the client to transmit the changes to the server).

Arguments are checked for equivilence, and unique query tree nodes are created for each argument set.

## Client-side Result Tree (Go)

As data arrives for the results, it is written into a result tree (a virtual representation of the result data). Result tree nodes are attached to their corresponding query tree nodes. If a query tree node is disposed, the relevant part of the result tree is also purged.

Results are written into the result tree. The result tree is not aware of how the results are exposed to the user of the Go client API. This is the job of another component, the ResultBuilder attached to each Query. Results are stored as a trie of RGQLValue objects (deduplicated paths).

The result tree has reference counts for each node, and data is purged from this tree when the query tree mutates.

Two types of result builders exist: map[string]interface{} based JSON representation, and binding to query structs.

The above query schema could be re-written instead as a query object:

```go
type MyQuery struct {
  // Mtx is the result mutex that is locked when updating the result in-place.
  Mtx sync.Mutex `rgraphql:",mutex"`
  // AllPeople contains the list of all people returned.
  AllPeople []*PersonNamesQuery `rgraphql:"allPeople"`
  // AllPeopleMtx can specifically lock the allpeople field.
  AllPeopleMtx sync.Mutex `rgraphql:"mutexFor="allPeople"`
  // AllPeopleErr contains any error when resolving AllPeople
  AllPeopleErr error `rgraphql:",errorFor=allPeople"`
}

type PersonNamesQuery struct {
  // Name is the name of the person.
  Name string `rgraphql:"name"`
}
```

A few interesting things here:

 - Errors can be "caught" with the "errorFor" flag.
 - Uncaught errors bubble up and terminate the query.
 - Mutexes are locked as the object is traversed, depth-first.

How are concurrent updates to the result handled?

 - Lock the result object with a root-level mutex.
 - Lock each level with optional granularity (add a result mutex tag)
 - Emit a new object each time (if Mtx is not found)

How do we bind the query structs to the client? Don't want to use reflection.

 - The ResultTree tracks path aliases and decodes the value stream (cursor tracking).
 - The full path of RGQLValue (as a slice) is emitted to every query result listener.
 - Use static analysis (same as resolver generation) and produce:

```go
// ResultHandler handles updates to the result tree.
type ResultHandler interface {
  // HandleResultUpdate handles an incoming path + value chain.
  HandleResultUpdate(result []*proto.RGQLValue)
}

// MyQueryResultHandler writes results for MyQuery to a MyQuery struct.
type MyQueryResultHandler struct {
  result *MyQuery
  // TODO: map query node ID to sub-field setter
}

// HandleResultUpdate handles an incoming path + value chain.
func (r *MyQueryResultHandler) HandleResultUpdate(result []*proto.RGQLValue) {
  r.result.Mtx.Lock()
  defer r.result.Mtx.Unlock()

  nod := result[0]
  if result[0].GetQueryNodeId() != r.qnodeID {
    return
  }

  // expect a query node id to indicate the sub-field of this object
}
```

How do we determine which query node goes to which field in this context?

This boils down into this simple rule set:

 - The Decoder un-aliases fields and emits each to a ResultHandler (`HandleResultUpdate(result []*proto.RGQLValue)`)
 - The ResultTree is a ResultHandler that caches the paths and calls attached downstream ResultHandlers.
 - When a Query is attached to a ResultTree existing []*proto.RGQLValue sets are re-constructed and emitted as the initial set.

We need to traverse the result tree in sync with the result and/or query object.

Create a mechanism to:

 - Call on enter node
 - Call on leave node

// Start at root query node
// {query_tree_node: 1} -> check RootQuery.nodeMap[1] -> handler func that points to next resolver
// {value: "Test"} -> call next handler, wiich sets the value to "test"

The best design here is:

 - Handler function that accepts a *RGQLValue
 - Optionally return a handler function for the next value in the sequence
 - Next handler is called N times for each path.

TODO: json_decoder_handler, decide how to handle result arrays.

## Useful Snippets

TODO: move these somewhere else

```
  // Create a statement that does _ = someIdent
	resolverFnStmts = append(resolverFnStmts, &gast.AssignStmt{
		Tok: gtoken.ASSIGN,
		Lhs: []gast.Expr{
			gast.NewIdent("_"),
		},
		Rhs: []gast.Expr{
			gast.NewIdent("someIdent"),
		},
	})
```

## JSON Decoder Design

The JSON decoder implements the result tree handler interface:

```
// HandleResultValue handles the next value in the sequence, optionally
// returning a handler for the next value(s) in the sequence.
HandleResultValue(val *proto.RGQLValue) ResultTreeHandler
```

At the root, the handler is initialized with:

 - Query node points to the root query node
 - Pointer to the result map `root: {}`
 - Result lock function (to lock the entire result object to apply changes)

When writing to the result object, the root result mutex is locked.

## Arrays with Removable Values

Values can be emitted in a stream for an array, by requesting a `chan<- string`
output channel, for example.

Values can be marked as real-time and updated by requesting a `chan<- chan
string`. Emit a new value by writing to the channel, and delete the value by
closing the channel.
