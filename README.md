# Soyuz

[![Build Status Widget]][Build Status]
[![Codecov Widget]][Codecov]

[Build Status]: https://travis-ci.org/rgraphql/soyuz
[Build Status Widget]: https://travis-ci.org/rgraphql/soyuz.svg?branch=master
[Codecov]: https://codecov.io/gh/rgraphql/soyuz
[Codecov Widget]: https://img.shields.io/codecov/c/github/rgraphql/soyuz.svg

## Introduction

Soyuz is a **Real-time Streaming GraphQL** client implementation for TypeScript / Javascript. It's:

 - **Streaming** with any two-way communication channel (like a [WebSocket](https://github.com/gorilla/websocket)).
 - **Live** updates to result data are streamed to the client in real-time.
 - **Fast** using [ProtoBuf](https://developers.google.com/protocol-buffers/) messages and optional binary encoding.
 - **Simple** - it drastically simplifies live and reactive data streams from modern backends to the browser.
 - **Efficient** with smart data deduplication and result batching.

rGraphQL in practice allows your apps to efficiently request the exact set of data from an API required at any given time, encode that data in an efficient format for transport, and stream live updates to the result.
