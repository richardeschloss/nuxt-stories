---
title: Todo
order: 5
---

# Date 01-17-2022
* [x] Lang select almost working, but for some reason, the $route.hash is not clearing and it's doing this weird thing holding onto the viewer component.
* [x] Bring back the sidenav in mobile view. (It's code was disabled)
* [x] ~~Bug: for some reason, the io service for running tests *with coverage* fails when the app runs. Sometimes works, sometimes doesn't.~~ Seems to work now.
* [x] Chore: update the docs / stories as needed.
* [ ] Feature: may want to auto scroll into view the side nav

# Date 01-13-2022
* [x] May want to have a version select dropdown in the navbar
  - [x] It's prop would be Array<Record<version, url>> and clicking on non-current ones would open in target _blank
* [x] Fix the handling of file change event. Active story needs to update.
* [x] Fix the scrolling. It's supposed to update the active state in toc.
* [x] Fix the viewer component when stories changes. Sometimes selecting the story updates the editor, but not the viewer. Seems to only hang when fetch is hung. Fixed by resetting the active story.
* [x] For some reason, the navigating in the side bar became less smooth. Hmm...(Update 01/16/2022: I fixed the quirkiness by updating the collapse component's initial values)

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
