---
title: TestCoverage
order: Infinity
---

# Design

Consume the generated HTML coverage report. Basically a wrapper around an iframe that grabs the source. The "coverage" directory" will be statically served at "/nuxtStories/coverage"

# Props

| Prop | Type | Default |
| --- | --- | --- |
| show | Boolean | false |
| file | String | '' |

The file is relative to the coverage directory, and for simplicity, leave off the ".html". So, for the module.js coverage report, it's simply `<NuxtStoriesTestCoverage file="module.js" />`

# Demo

<NuxtStoriesTestCoverage file="module.js" />