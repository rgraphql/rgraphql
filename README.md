# rGraphQL

[![Build Status Widget]][Build Status]

[Build Status]: https://travis-ci.org/rgraphql/rgraphql
[Build Status Widget]: https://travis-ci.org/rgraphql/rgraphql.svg?branch=master

## Introduction

**Real-time GraphQL** is a project to add live data and streaming results to the [GraphQL](http://graphql.org/) query language.

By using any two-way connection between clients and servers, rGraphQL is able to stream changes to both queries and results in real-time. The server can parallelize execution of resolver functions, loading data as fast as possible.

In this way, the server resolves exactly what the client needs at any given time. Unlike REST, rGraphQL **never duplicates data** sent between the client and server, making it **extremely bandwidth efficient**.

The client and server implementations are easy to get started with and simple to use. The code has been designed with an emphasis on simplicity.

Get started by picking a client and server:

Clients
=======

 - [Soyuz (.ts)](https://github.com/rgraphql/soyuz)

Servers
=======

 - [Magellan (.go)](https://github.com/rgraphql/magellan)

