---
title: SideNav
order: 5
---

# Design

The side nav shall contain the stories *tree* and a link back to the main app. All links should use "$router.push" instead of hard links so that navigation is fast (without the annoying page reloading that occurs with normal links).

If we're on a mobile device, the side nav shall start hidden, and have it's visibility controlled by the header's overflow toggle button. 

The stories shall be ordered by the `order` property set in each story's frontMatter. The stories are sorted for the same shared level.

CRUD operations on stories shall be enabled if we are running the server. Otherwise, if on a staticHost, CRUD operations will be disabled. CRUD means to support the following

- Level0: Add story only
- Level1 or deeper: 
  - Add story
  - Rename story
  - Remove story

Clicking either the "rename" or "remove" buttons shall bring up a set of confirmation buttons (checkmark and x) before following through with the operation.

As a convenience to the user, change the title property in the story's frontMatter will rename the story, but renaming the story won't necessarily change the frontMatter's title.

The active story is determined by the current route path. If the story is active, a visual indication (css class === 'active') shall be provided. Whenever the route's path changes, the active story shall change too. Also, if the active story has children, its children shall be expanded so that we can see them.

If CRUD operations are enabled, the appropriate control shall be revealed on story item's `mouseenter` event and hidden on it's `mouseleave` event (not mouseover and mouseout events...those will cause undesireable behavior)

The Sidenav makes use of the `<NuxtStoriesCollapse/>` wrapper component to accomplish the task of collapsing / expanding the story children. (That component works by setting a CSS transition on the "height" property, and then simply toggling that height from 0px to the element's scrollHeight.)

## Future consideration

May want also allow drag-n-drop to control the ordering of stories in the sidenav.

# Demo

<NuxtStoriesSideNav />