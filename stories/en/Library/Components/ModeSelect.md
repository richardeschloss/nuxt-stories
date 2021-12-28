---
title: NewStory0
order: 1
---

# Design

When first mounted, set viewMode from localStorage (key: `nuxtStoriesViewMode`)

When the toggle buttons are clicked, update the viewMode in both localStorage and vuex (in vuex so we can take advantage of reactivity...when the viewMode changes, other parts of the app, like the content area can change right away).

# Demo

<NuxtStoriesModeSelect />

# Notes on Performance

The mode select currently relies on Bootstrap-icons, which can be heavy. It may better design to just pull in the SVGs we need and use those instead of the full icon library. However, the icon library is convenient because just by changing the class name, we can change the icon and see results quickly. 