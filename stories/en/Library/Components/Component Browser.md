---
title: Component Browser
order: Infinity
---

# Design

As part of the "stories" layout, the component should be there already (not in this editor). It shall rest in the lower right corner. Mouseenter to expand, mouseleave to collapse.

It shall display a filter box for quickly filtering the list of available components. Hovering over (
"mouseover" event) the component and staying there for 1 s shall popup a component previewer modal. This gives an idea what we may wish to place on the canvas, before committing. 

Dragging an element to the canvas shall insert it into the editor. By taking advantage of the browser's built-in way of dealing with dragging and dropping selected text, we'll simply just select all the text in the component list when the user wants to drag it to the editor. This way, the component can be dropped to the exact cursor position.

## Style

The placeholder text shall be "Browse Components", but becomes more visible when we actually click on the text box. Inspired by Gmail's "new message" design, the component browser modal will reuse the box-shadow to make it look pretty.