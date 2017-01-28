Protocol
========

When we initially connect to the server, we build a snapshot of the tree and send it to the server. Following, every update to the tree gets transmitted to the server, and batched by time (every 10-50ms to avoid message spam).

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

When processing the requested query, the server will assign each resolver an identifier automatically. When it receives a value back for that resolver, the server sends a message to the client (RGQLValueMutation) with the initial value for that field.

The behavior of the value tree differs for different kinds of tree nodes:

 - Field: VALUE_SET on a field sets that field's value specifically.
 - Selection set: VALUE_SET on a selection set batch sets the sub-fields.
 - Array field: VALUE_PUSH on a array field adds a sub-resolver to an array and batch sets the selection set sub-fields.

This way, the server builds a shared dictionary of resolver IDs with the client. Changes to sub-fields can be expressed in very few bytes - just the variable length identifier of the node and the value itself. This reduces network traffic significantly.
