Query Tree
==========

There is a store, that forms a global view of all the required data. For example, these two queries become the third global query:

```graphql
query myQuery {
  people(age: 40) {
    name
  }
}
```

```graphql
query myOtherQuery {
  buildings(height: 3) {
    name
  }
}
```

```graphql
query mergedQuery {
  myQuery: people(age: 40) {
    name
  },
  myOtherQuery: buildings(height: 3) {
    name
  }
}
```

Internally, we merge these into a tree. Each leaf in the tree is one part of the query. We can compare different children elements of queries to see if they are the same, or otherwise indistinct (the same thing written differently). If two parts of a query match, we increment the reference count on a leaf and continue. Otherwise, we place a new leaf in the tree.

This tree is mixed down to a Protobuf structure and sent to the server. The server returns the data to the client as it is resolved, in a constant stream.

The client broadcasts changes to this tree to the server. The server starts and stops resolvers as necessary. A future optimization could be to deduplicate resolver executions depending on schema properties (mark a field as non-unique between users, for example).

So, in summary: the UI code can query a GraphQL schema in the traditional way. The communication between the server and client is a two-way conversation.

More Info
=========

See the [Design](https://github.com/rgraphql/magellan/blob/master/DESIGN.md) document from Magellan.
