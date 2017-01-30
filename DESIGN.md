The standard usage of this library should look like:

 - Parse schema, build/validate resolver tree
 - Create a client using that schema.
 - That client maintains context (remote query tree, etc).
 - Call `client.HandleMessage(message)` and have a channel for outgoing messages.
 - Use a context for each client.
 - Server maintains a query tree, in sync with the client-side tree.
 - Server should control starting/stopping resolvers when necessary.
 - This can be achieved with a server-side value (resolver) tree.
