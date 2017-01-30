Magellan - Streaming GraphQL Server
====================================

Magellan is the rGraphQL server implementation for Golang.

RealTime GraphQL is a different approach to GraphQL. If you're new to rGraphQL, see the project [documentation](https://github.com/rgraphql/rgraphql).

Parts of this project are based on work by @neelance from the [graphql-go](https://github.com/neelance/graphql-go) server implementation.

Quick Start
===========

Magellan requires a [rGraphQL](https://github.com/rgraphql/rgraphql) capable client, like [Soyuz](https://github.com/rgraphql/soyuz). It currently cannot be used like a standard GraphQL server, although this is planned in the future.

Magellan builds results by executing resolver functions, which return data for a single field in the incoming query. Each type in the GraphQL schema must have a resolver function for each of its fields. The signature of these resolvers determines how Magellan treats the returned data.

Queries in Magellan are not one-off. Fields can return streams of data over time, which creates a mechanism for live-updating results. This requires a two-way communication channel between the client and server, which is provided by the user of the library (that's you!). One possible implementation could consist of a WebSocket between a browser and server.
