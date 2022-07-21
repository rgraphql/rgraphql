# rGraphQL

[![GoDoc Widget]][GoDoc]

> Two-way streaming GraphQL over real-time transports (WebSockets).

[GoDoc]: https://godoc.org/github.com/rgraphql/rgraphql
[GoDoc Widget]: https://godoc.org/github.com/rgraphql/rgraphql?status.svg
[Go Report Card Widget]: https://goreportcard.com/badge/github.com/rgraphql/rgraphql
[Go Report Card]: https://goreportcard.com/report/github.com/rgraphql/rgraphql

## Introduction

rGraphQL is a **Real-time Streaming GraphQL** implementation for Go. It:

 - Uses any two-way communication channel with clients (e.x. **WebSockets**).
 - Analyzes Go code to automatically generate resolver code fitting a schema.
 - Streams real-time updates to both the request and response.
 - Efficiently packs data on the wire with Protobuf.
 - Simplifies writing resolver functions with a flexible and intuitive API surface.
 - Accepts standard GraphQL queries and produces real-time output.
 
**rGraphQL** protocol allows your apps to efficiently request the exact set of
data from an API required at any given time, encode that data in an efficient
format for transport, and stream live updates to the result.

[**Magellan**](https://github.com/rgraphql/magellan) is a code-generation based
GraphQL engine and protocol for Golang, with a client [Soyuz] written in
TypeScript and designed for React-like interfaces.

[Soyuz]: https://github.com/rgraphql/soyuz
