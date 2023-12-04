# Soyuz

> GraphQL queries with streaming live-updating results.

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

[Magellan]: https://github.com/rgraphql/magellan

## Support

Please file a [GitHub issue] and/or [Join Discord] with any questions.

[GitHub issue]: https://github.com/rgraphql/soyuz/issues/new
[Join Discord]: https://discord.gg/KJutMESRsT
