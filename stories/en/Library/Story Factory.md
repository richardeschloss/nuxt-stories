---
title: Story Factory
order: Infinity
---

# Design

This is really where the magic happens. This takes as an input the render functions from Vue's compiler. It also consumes the frontMatter, and fetched data, if there is any to be fetched. It then spread all those objects onto the `data()` set so that the generated component from StoryFactory can easily access those data values. 

# Demo

It's technically here. In the front matter, I specify title, and any time I want it's value, I surround it with double curly brackets: {{ title }}. 

# Tests

<TestRunner testFile="test/specs/StoryFactory.spec.js" :coverage="true" />

# Coverage
<TestCoverage file="storyFactory.js" />