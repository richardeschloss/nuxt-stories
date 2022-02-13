---
title: Style Editor
order: Infinity
---

# Design
The style editor is meant to help with editing styles for elements in the Nuxt Stories *Viewer* (this can include Vue components). It shall rest in the lower right corner, behind the component browser. It shall expand out and move in front of the component browser on mouseenter (and collapse back on mouseleave). 

Hovering over an element in the viewer shall bring up the tooltip "DblClick to edit style" (or similar) if and only if the element does not currently have it's "title" attribute set.

For now, it seems the most reliable way to have this work is to only style elements with either "id", "classList" (or maybe even component name). This way, it's easy to organize styles based on the specific css selector, and quickly see the applied styles that would eventually be merged in to the corresponding css selector (id or class name)

- If the element has an id, save the style with that id (css selector '#' + id)
- If the element has class names, save the style with the class names joined (css selector = '.' + elm.classList.join('.'))
- If the element has neither of these things, then we can perhaps still allow for quick-and-dirty styling, but without the auto saving of the styles. With Vite, the HMR is pretty fast too when we change css there...

The modal-header shall show the element (css selector) currently being edited.

Standard formatting buttons for B / I / U should be in a toolbar for the selected element. Will probably also want to have
* [x] B (font-weight: bold;)
* [x] I (font-style: italic;)
* [x] U (text-decoration: underline;)
* [x] FG (color: [selectedFGColor])
* [x] BG (background-color: [selectedBGColor])
- [x] Font-Family select
- [x] Font-size select
- ~~[ ] Gradient editor~~. Maybe someday.
  - Docs for [linear-gradient](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/linear-gradient())
  - Docs for [radial-gradient](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/radial-gradient())
- [x] Fix some of the quirky buggy behavior
- [ ] Update this story / docs


# State

| Prop | Description | Value |
| --- | --- | --- |
| stylingSelector | The CSS selector of the element being styled | {{ $nuxtStories().value.stylingSelector }} |
| styles | saved styles, keys are css selectors | <json :data="$nuxtStories().value.styles" /> |

# Lifecycle and Events

When the style editor first mounts, load the styles from localStorage and apply the styles. When either the styling selector changes or Viewer gets re-compiled, also re-init the styles.

# Demo

## Can edit
<p id="my-p">My paragraph</p>

The `<hello />` component with id="hello-id":
<hello id="my-id" />

## Can not edit
Here is a paragraph from markdown (no id or class; so style editor will have no effect on this)

