---
title: Content
order: 7
---

# Design

The content is where the stories get written and viewed. The content will either be just the editor, just the viewer or both. To simplify the layout, the CSS grid is used, specifying grid columns "1fr 1fr" when in split view, and only "1fr" other cases. 

Both the editor and viewer components take "story" (the active story) as a prop.

## Editor

The editor starts out as a `<div>` with its content set to that of the active story. On `mouseenter` it becomes a `<textarea>` input so that we can edit the content *easily* (even though a div can have a "contenteditable" attribute, that attribute is deprecate and causes the div to have issues when dealing with whitespace and new lines). The reason for still using a div however, is to greatly facility the scrolling to specific sections. 

The scrolling feature in the editor works as follows. The current $route hash determines what section needs to be scrolled to. While `String.prototype.match` can tell us the index of the match, the cursor within a textarea element can't tell us the xy-position of that cursor on the screen. Therefore, the textarea has to be changed into a div that has three children:
1. the text before match
2. a dummy [empty] cursor element at the match
3. the remaining text  

This way, we get the cursor exactly at the point we want, and only need it's y-position to determine how much to move the scroll bar. 

The editor's scrolling only works when it's a div. Therefore, it starts out as a div, and returns to being a div on `mouseleave` events (which would happen if the user clicks one of the table-of-contents links or updates the URL). 

When the editor is a `<textarea />` and the user types input, the following happens:
1. If we're not on a static host, the changes get communicated back to the server (and the changes are automatically saved)
2. The content associated with the active story gets updated in Vuex (so dependents, like the viewer and sidenav, get notified and can work with the updates). The sidenav in particular will update when the `frontMatter.order` has changed.

It's possible that the user is making changes to the content on the filesystem. Since we are watching for those changes, when those changes occur, they'll be reflected in the editor. (Guards are put in place to check if the input is from user typing in the textarea vs. saving the file in a different editor).

The frontMatter is very powerful can become more powerful in the future. Today, changing the title will quickly rename the story; this is actually faster than renaming it in the sidebar.

The following debounce times are in place:
* `inputDebounceMs` - to measure if we're actively typing. (default: 350ms; every 350ms, any input that is typed will reset the timer and start it over. 350 ms after no input, the timer will be cleared)
* `titleDebounceMs` - time to wait before renaming the title (default: 750 ms; if we're still editing the title, don't rename the story until 750 ms has passed after our last keystroke)

## Viewer

The viewer displays the compiled content. Specifically, it implements this pipeline:

* Content --> Compile Markdown --> Compile Vue --> Extend Compiled Vue with Story features

It makes use of the following utilities to make the pipeline work:

| Utility | Description |
| --- | --- |
| utils/markdown.js | First parses out the frontMatter with [gray-matter](https://www.npmjs.com/package/gray-matter) (note: gray-matter requires `Buffer` to be polyfilled). Then it also provides the table of contents and compiled markdown as HTML *markup*. Even though table of contents is parsed out, it's not used in the viewer. Instead, it gets attached to the active story in Vuex and later consumed by the toc component; recall the sidenav initially sets the active story, and the editor updates it |
| utils/vue.esm.js | Compiles the HTML markup  |
| utils/storyFactory | Consumes the render functions generated by the Vue compiler and then, from that, creates a component with the story features we desire, such as fetch. Using a Story Factory lets us expand on the kinds of features we want to add in the future  |

### Auto scrolling feature

The viewer does two important things: 
1. It auto scrolls to the header matching the current $route.hash (but note: headers have to be unique for this to work! headers are "id"s).
2. It *observes* the scrolling (using [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)) so that as we scroll from one section to the next we can: update the $route hash, scroll the editor, and update the active header in the table of contents.


# Demo

You're using it right this second 😊

# Future consideration

It may be desired to have a rich-text editor on the viewer, which would also update the styles. The styles would have to be persisted. This may be considered "seamless mode".