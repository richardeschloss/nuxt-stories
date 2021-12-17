---
title: Readme
order: Infinity
---

# Description 
The `<NuxtStoriesReadme />` component is a wrapper around the `<NuxtStoriesMarkdown />` component to compile your project's README file into beautiful HTML markup. It works by mapping requests for "/nuxtStories/README.md" to "[yourApp]/README.md" so as to not conflict with any requests to "/README.md" that may be different. 

This makes it super easy to place the docs right on your landing page if you want. Just like this app does. One tag and done. In addition to compiling the markdown, it also tries to compile Vue.

## Props

| prop | description | default |
| --- | --- | --- |
| compileVue | Also compile Vue after compiling Markdown | false |

# Demo 

<NuxtStoriesReadme / <-- the second you close the tag you should see the readme display :)

## Expected result

<NuxtStoriesReadme />

# Tests

<NuxtStoriesTests testFile="/e2e/Readme.js" componentName="NuxtStoriesReadme" />
