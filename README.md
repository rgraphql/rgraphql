Soyuz - Realtime Graph Query Language Client [![Build Status](https://travis-ci.org/rgraphql/soyuz.svg?branch=master)](https://travis-ci.org/rgraphql/soyuz)
============================================

rGraphQL (rgql) is a lightweight, streaming GraphQL client with a focus on real-time support. It's a different approach to GraphQL. Soyuz is the JavaScript/TypeScript client for rGraphQL.

If you're new to rGraphQL, read the [overall documentation](https://github.com/rgraphql/rgraphql) first.

This client is intended to work with realtime GraphQL servers first, but also is designed to be used with a regular GraphQL server in addition or in place of a realtime server. This could be used to balance large, heavy one-shot queries over a HTTP load balancer, while doing live data queries over a two-way socket.
