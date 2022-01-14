---
title: Search
order: 2
---

# Design

The search box is the direct input to LokiDB's full text search. If we're on a staticHost, use the LokiDB on the client, otherwise, use the one on the server.

Add an event listener to the `window` for "Ctrl + /". When this happens the first time, the search box shall be brought into focus. If any input was entered and "Ctrl + /" is entered again, the input and results, if any, shall be cleared.

The database (store/db.server.js) indexes the fields "href" and "content" for Loki's full text search feature. Therefore, when text is entered into the search box, the FullTextSearch feature will search for that term in all of the stories "href" (i.e., story path) and "content". 

The search hits come in as an array of:
- labels (which is the path split by "/"); so we can format it cleanly into breadcrumbs
- href; so we can navigate to that item
- content
- preview: which is the small snippet of text containing the match, padded by 25 characters on both sides. This way we can highlight the match and see it's context within the content.

# Events

| Event | Action |
| --- | --- |
| Ctrl + '/' on window | Toggle focus to the search box. Clear search box if text entered |
| Text input | Search |
| Search hit click | Navigate to that story |

# Demo

(Note the actual demo below won't be perfect because the styles rely on it being placed in the header)

<div style="background: black;"><NuxtStoriesSearch /></div>