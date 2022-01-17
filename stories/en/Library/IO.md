---
title: IO
order: 3
---

# Design

This is the glue between the client and server. Someday, it may grow into being the glue between one user and a distributed set of users, which is why socket.io was chosen; so that events could easily be broadcast.

On a high level, it supports the CRUD operations for all the stories, as well as performing tasks that are intended to run server-side. This may be viewed as "backend for front end". 

When file changes are made to the system, socket.io is used to communicate those changes to the client.

And recently, a testing interface was added so that tests could be triggered from the client. The server side spawns the child process and returns the results.

# Tests
[Omitted since the tests may conflict with this app]

<TestRunner testFile="test/specs/IO.spec.js" />

# Coverage
<TestCoverage file="lib/io.js" />
