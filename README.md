# Soyuz

[![Build Status Widget]][Build Status]

[Build Status]: https://travis-ci.org/rgraphql/soyuz
[Build Status Widget]: https://travis-ci.org/rgraphql/soyuz.svg?branch=master

## Introduction

Soyuz is a **Real-time Streaming GraphQL** client implementation for TypeScript / Javascript. It's:

 - **Streaming** with any two-way communication channel (like a [WebSocket](https://github.com/gorilla/websocket)).
 - **Live** updates to result data are streamed to the client in real-time.
 - **Fast** using [ProtoBuf](https://developers.google.com/protocol-buffers/) messages and optional binary encoding.
 - **Simple** - it drastically simplifies live and reactive data streams from modern backends to the browser.
 - **Efficient** with smart data deduplication and result batching.

Soyuz uses a two-way communication channel with servers. It fetches exactly what your app needs at any given time, and streams results along with live updates back to your UI code.
