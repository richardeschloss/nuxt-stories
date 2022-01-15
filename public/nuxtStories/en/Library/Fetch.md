---
title: Fetch
order: Infinity
fetch:
  someCsv: /someFile.csv | csv
nodeFetch:
  someJson: /someJson.json | json
---

# Design

Utilities are separated into client-side (fetch) and server-side (nodeFetch), with the server-side fetch reusing most of the client-side code.

Whether `fetch` or `nodeFetch` is specified, the entries format is the same: an object that maps variable names to urls (or paths) to fetch. Those variables then get assigned to the component's context. 

For each entry, the fetch utilities parses the variable name and resolves the full fetch URL. The full URL is particularly required for the server-side fetch (since it can only make sense of absolute URLs there).  

For each URL and corresponding set of fetch options, if any, fetch the URL and if we're on the client, save the response to the shared state. If a destination, such as localStorage or sessionStorage, is specifed, also persist the response there. For each successful response (or error), notify the caller so that progress can be observed without waiting for all requests to finish.

Still though, provide the full set of responses

## Local state
* Fetched
  - someCsv: <json :data="someCsv" />
  - someJson: <json :data="someJson" />

## Fetched shared state

<json :data="$nuxtStories().value.fetched" />

# Tests

<TestRunner testFile="test/specs/Fetch.spec.js" />

# Coverage

<TestCoverage file="fetch.js" />
