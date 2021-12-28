---
title: Root
order: 0
---

# Design

This is the entry point of the stories UI. It consists of the header and the body.

## Lifecycle

When it mounts, it will lazy load the styles and should lazy load the header and body components. It then shall fetch the stories:

* If we're on a static host, fetch from the client-side DB
* Otherwise, fetch from the server

# Children
## Header

The header consists of the following:

- Logo
- View-mode Select: 'edit', 'split' or 'view'. This component caches and uses last toggled mode to / from localStorage.
- Search: this ties directly into LokiDB full text search
- Lang select
- Github Logo

## Body

The body consists of the following:
- the sideNav
- the main area (which itself is a grid divided in to breadcrumbs, content and table of contents.
