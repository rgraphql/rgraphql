# Soyuz

> GraphQL queries with streaming live-updated results.

## Introduction

Soyuz is a **Real-time Streaming GraphQL** client implementation for TypeScript / Javascript. It's:

 - **Streaming** with any two-way communication channel (like a [WebSocket](https://github.com/gorilla/websocket)).
 - **Live** updates to result data are streamed to the client in real-time.
 - **Fast** using [ProtoBuf](https://developers.google.com/protocol-buffers/) messages and optional binary encoding.
 - **Simple** - it drastically simplifies live and reactive data streams from modern backends to the browser.
 - **Efficient** with smart data deduplication and result batching.

rGraphQL in practice allows your apps to efficiently request the exact set of data from an API required at any given time, encode that data in an efficient format for transport, and stream live updates to the result.

## Server

Head over to the [Magellan] repository for the server / Go runtime.

[Magellan]: https://github.com/aperturerobotics/magellan

## Developing

rGraphql is an ongoing work in progress, so please feel free to help out, file issues, usability
improvements, and/or PRs. Thanks!
