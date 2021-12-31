---
title: Todo
order: 5
---

# Date 12-16-2021

* [x] Re-add the story factory features
  - [x] Fetch
  - [x] Node-fetch
  - [x] ~~Dynamic import~~ deprecated (potentially unsafe feature, and benefit not worth it. Vite is now here and fast enough)
* [x] Update tests (and perhaps use this time to tinker with test-scaffolding)
* [x] Update README.md and docs. 
  * [x] Scrub out deprecated info
  * [x] Perhaps remove duplicated stories; for example. README.md and Documentation are pretty much identical. 
* [x] Scrub out nuxtStories store... some dead stuff in there.

## Quirks
* [x] Some weird error occurs sometimes when horizontally scrolling the viewer. WTF is going on.. the intersection observer code? I think there was a dangling undefined value.. I put the guard in and things seem fine now.
* [x] [Fixed] The editor uses a trick to get quick scrolling to headers to work: when the mouse is not on the editor, it transforms from a `<textarea />` to a `<div />` so that a dummy cursor can move to the matched header (and give us its y-position). But when the item turns into a div, the scroll bar goes back to the top. It's position should probably be preserved...(otherwise it can be kind of annoying writing long stories)

# Nice to have 

* Might be useful to have *named cells* that can be referenced across multiple stories. I'm thinking a simple syntax could be used to define a cell, and then save that data in Vuex (or some global state, client db?). This way, as we type our stories we can keep providing sets of data in context without having to scroll up to the frontMatter
  - On this note, all stories (including their frontMatter) is stored globally already. 

* Quick components for common embeds:
  - Youtube. I.e., `<youtube video=[id] />` instead of the lengthy Iframe codes.
* Perhaps a "design mode" that lets each HTML tag in the viewer get styled and then have those styles back-saved. I know chrome dev tools lets the FS be loaded, but it's still in the drawer or to the side. I think I'd go faster if the styling tool were on the UI. 
* Language translation for the stories. So that way the language dropdown doesn't just switch stories, but it translates existing ones to a desired language.

# Old Items

3. Would be nice to have a "knobs" / "actions" feature 
4. Footer for navigating prev / next stories.
5. Would be nice to have tests get auto-scaffolded based on the stories. Perhaps selecting "jest" or "ava" would rapidly scaffold the tests.
6. Might be nice to have stories get auto-generated for components that currently exist in the components dir. (I think? Or would synching all that be a pain?)
7. Update meta tags (and og:image) for this deployed app.
8. As mentionned in github issues, these are the wishful things: observerablehq integration (?), h-wiki backend (?).

...
