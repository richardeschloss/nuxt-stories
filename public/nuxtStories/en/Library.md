---
title: Library
order: Infinity
---

The library's entry point is 'lib/module.js'.  In addition to extending routes, the library also provides this UI, which includes all its assets, components, storage module, and utilities. 

It uses socket.io on the backend to help with story management. This design choice was intentional so that stories can live anywhere, and have socket.io be something that broadcasts the change events.

