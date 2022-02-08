---
title: Style Editor
order: Infinity
---

# Design

The style editor is meant to help with editing styles for components (and elements?) in the Nuxt Stories *Viewer*. It shall rest in the lower right corner, behind the component browser. It shall expand out and move in front of the component browser on mouseenter (and collapse back on mouseleave). 

Hovering over an element in the viewer shall bring up the tooltip "Ctrl + dblClick to edit style" (or similar) if and only if the element does not currently have it's "title" attribute set.

The element to be styled shall be on "Ctrl + dblclick" event for the following reasons:
- It seems like it's rare enough where it wouldn't interfere with a component's own event. But, even if it interferes, our event handler should not prevent propagation (so that other event handlers should work too). Here, the purpose to just set a property in Nuxt stories' internal state and move on. 
- Ctrl + dblclick seems like it's better than dblclick, since dblclick is more common for other actions. The addition of "ctrl" requires a bit more thought and intention.  

The tricky part seems to be, we can easily edit the style but then...how or where to save it? My initial thoughts are:

- If the element has an id, save the style with that id (css selector '#' + id)
- If the element has class names, save the style with the class names joined (css selector = '.' + elm.classList.join('.'))
- If the element has neither of these things, then we can perhaps still allow for quick-and-dirty styling, but without the auto saving of the styles. With Vite, the HMR is pretty fast too when we change css there...

# State

| Prop | Description | Value |
| --- | --- | --- |
| stylingElm | The HTML element currently being styled | {{ $nuxtStories().value.stylingElm?.outerHTML }} <br> id: {{ $nuxtStories().value.stylingElm?.id }} <br> classList: {{ $nuxtStories().value.stylingElm?.classList }}  |
| stylingSelector | The CSS selector of the element being styled | {{ $nuxtStories().value.stylingSelector }} |
| styles | saved styles, keys are css selectors | <json :data="$nuxtStories().value.styles" /> |

# Lifecycle and Events

When the style editor first mounts, load the styles from localStorage and apply the styles. 

# Demo

Here is a paragraph from markdown (no id or class)

<p id="my-p">My paragraph</p>

The `<hello />` component with id="hello-id":
<Hello xid="my-id" />