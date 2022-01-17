---
title: Table of Contents
order: 8
---

# Design

This component sits in the right-most column and displays the table of contents for the active story. It shall also use a heavier (bold enough) font to indicate the active header. 

It consumes the active story as a prop, and from `story.toc` builds out the toc tree. Since all we really care about in the toc is that it *looks like* a tree, we can have it consume data that is actually flat, with each entry specifying it's depth in the tree. Then, all we really need to control is the headers *indentation* in the list, which is some multiple of an arbitrary indentation that looks good; any item's indentation is simply [depth] * [base indentation]. This will give the look we want without actually having to traverse a tree.

Clicking on any of the headers shall trigger the app's $router to push that hash so we navigate right to that section. To get the scrolling working correctly, if we've progressed through a section, and we click on that section's header again, we have to employ a small trick to get the scrolling back to the top of that section. We have to temporarily push '' wait 1 ms, then push the current route hash again so that the viewer component see that change. (Otherwise, the change get noticed and no scrolling takes place).

Recall it is the viewer that keeps track of the active header. It communicates this info up the component tree and it is consumed by the toc component. When it changes, it updates the active header in it's toc tree.

# Props 

| Prop | Type | Description |
| --- | --- | --- |
| story | Object | Active story. `story.toc` contains the table of contents |
| activeHdr | String | Active header within the story |
| viewerScrolling | Boolean | Viewer is scrolling. If it's not scrolling update the internal "navigating" boolean to false. (Clicking on one of the toc headers sets "navigating" to true |

# Demo

<NuxtStoriesToc :story="$nuxtStories().value.activeStory" />

