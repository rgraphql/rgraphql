rGraphQL - Realtime Graph Query Language
=======================================

rGraphQL (rgql) is a lightweight, streaming GraphQL client with a focus on real-time support. It's a different approach to GraphQL.

rGraphQL embraces the core ideas of GraphQL while making some core assumptions that enable a fully realtime, streaming system.

A rGraphQL client communicates with a rGraphQL server over a two-way channel. UI code can declare dependencies on data using standard GraphQL queries. Then, rGraphQL builds a global query document declaring the current desired data on the client. As the requirements of the client change over time, rGraphQL keeps this document up to date and synchronized with the server. The server can then stream changes to satisfy the requirements over time.

rGraphQL is designed to handle modern GraphQL query directives like `@stream` and `@live`. It's also designed to aggressively implement other kinds of optimizations that require a two way communication between a server and client.
