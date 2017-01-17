Soyuz
=====

Soyuz is a lightweight, streaming GraphQL client with a focus on real-time support.

Soyuz is designed to handle modern GraphQL query directives like `@stream` and `@live`. It's also designed to aggressively implement other kinds of optimizations that require a two way communication between a server and client.

At its core, Soyuz is a data store that describes all of the ongoing queries. It keeps track of what data it currently needs to know about, and then builds its own queries to fetch this data from the backend.

In this way, your UI code is actually querying against Soyuz's store, which then goes and fetches whatever extra data is required on its own.
