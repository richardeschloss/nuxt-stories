---
title: Component Browser
order: Infinity
---

# Design

As part of the "stories" layout, the component should be there already (not in this editor). Mouseenter to expand, mouseleave to collapse.

It shall display a filter box (or maybe a datalist component?)

Dragging an element to the canvas shall insert it into the editor. For now, it'll append to the end of text (once in the editor, it can be dragged again). I'm not sure how to move the cursor position after the initial drop; I'm guessing it would be at the event.y position or something.