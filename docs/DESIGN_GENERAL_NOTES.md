# Query-Tree Negotiation

When we initially connect to the server, we build a snapshot of the tree and send it to the server. Following, every update to the tree gets transmitted to the server as queries are applied to the store.

Tree updates come in the following flavors:

 - Add subtree
 - Delete subtree
 - Add directive to field
 - Remove directive from field

What do we mean by "subtree?"

Consider the following query:

```graphql
{
  people {
    name
  }
  person(name: Sam) {
    age
  }
}
```

Here we can represent the query as a tree:

```
   root
  /    \
people  person
  |       |
 name    age
```

Consider then if we want to make the tree look like this:

```graphql
{
  people {
    name
  }
  person(name: Sam) {
    age
    friend {
      name
    }
  }
}
```

We can transmit the change as "add this tree as a child of person" with the tree being:

```graphql
friend {
  name
}
```

Say we then want live updates on that field. We can transmit "add directive @live to field name on friend on person." Finally, we consider the value of the arguments to the resolver as being part of the resolver name. The arguments are immutable. To change the arguments to a resolver, the node will be deleted and re-created with the new arguments.

Each node in the tree has a unique identifier, which is used when communicating with a realtime server. This saves time by building a map between node ID and nodes in the tree, speeding up lookups and saving time by avoiding tree traversals to apply changes.

We build a second tree, called the "Value Tree." This tree keeps track of data sent back from the server.

We can identify every resolver executed by the server. For example, if we were to run this query:

```graphql
people {
  friends {
    name
    age
  }
}
```

Here, assuming a single person with a single friend, four resolvers will be executed: `people`, `people[0].friends`, `people[0].friends[0].name`, `people[0].friends[0].age`. We can represent each of these executed resolvers as a node in the value tree. Each executed resolver is assigned an identifier, just like in the query tree.

When processing the requested query, the server will assign each resolver an identifier automatically. When it receives a value back for that resolver, the server sends a message to the client (RGQLValueMutation) with the value for that field.

This way, the server builds a shared dictionary of resolver IDs with the client. Changes to sub-fields can be expressed in very few bytes - just the variable length identifier of the node and the value itself. This reduces network traffic significantly.

Variables are handled a bit differently. Imagine these two queries:

```graphql
query myQuery($postCount: Int!) {
  recentPosts(count: $postCount) {
    title
  }
}
query myOtherQuery($peopleCount: Int!) {
  famousPeople(count: $peopleCount) {
    name
  }
}
```

Say we request `myQuery(4)` and `myOtherQuery(4)`. We could represent this tree like this:

```graphql
{
  recentPosts(postCount: 4) {
    title
  }
  famousPeople(peopleCount: 4) {
    title
  }
}
```

This is actually a waste of data though, since we can de-dupe a bit. Instead, Soyuz aggressively de-duplicates arguments down into as few variables as possible. It would transform this tree into something more like this:

```graphql
query myQuery($a: Int!) {
  recentPosts(postCount: $a) {
    title
  }
  famousPeople(peopleCount: $a) {
    title
  }
}
```

The server can be given variable values at the same time as query tree additions. However, the server will forget any variables that aren't relevant to the current query. This way the server keeps only the data it needs in memory with minimal messaging overhead and de-duplicated variable values.

# Distributing data to queries efficiently

Issue: we have a result tree that looks like:

```
0: {
  1: {
    2: "John",
    3: "Doe",
    4: 28
    5: [153, 148, 140, 133]
  }
}
```

The array in qnode 5 needs to be shared between the queries. We can detect when we have reached a leaf when there are no child query nodes.

Here we have the issue. Cursors often extend into the values, past the qnode child leaves. We need to detach the cursors in the queries when reaching a value node.

 - Cursors will need to build a "path so far" array (unfortunately).
   - This is necessary for caching.
   - Array of tuples, with `[Kind, (ArrayIndex/QueryNodeID), ValueKind]`
   - Examples (note that "value" in these points to location, is not a copy):
     - `ResultTree: {1: {2: [6123, 1523]}}`
       - Sequence:
       - `[Kind.QNodeID, 1, ValueKind.Object]`
       - `[Kind.QNodeID, 2, ValueKind.Value, [6123, 1623]]`
     - `ResultTree: {1: [{2: "test"}, {2: "what"}]}`
       - Sequence:
       - `[Kind.QNodeID, 1, ValueKind.Array]`
       - `[Kind.ArrayIndex, 0, ValueKind.Object]`
   - When reaching a value, drop the path so far and result tree.
 - Allow passing a map of query ID -> location pointers to a result tree cursor.
 - When adding a new query:
   - Iterate `DFS` over the current known result tree, applying values to the result.
   - Iterate over all known cursors, and add query by:
     - If the path sequence terminates in a Value then ignore cursor.
     - Iterate over path sequence, updating location.
 - When removing a query:
   - Iterate over all known cursors, remove query ID from map.
