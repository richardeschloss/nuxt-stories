---
title: Usage
order: 3
---

# Usage

When you first install the module, the folder `stories` should be created with example stories in it. This folder is treated exactly like your pages folder, except that your stories go in this one. Routes are auto-created using the same `createRoutes()` utility that Nuxt uses to create your pages routes, so you can structure your stories similarly. To avoid conflicting with any real routes that might be named "stories", the story routes will start at "stories". In addition, you might find it useful in your workflow to have the "stories" really close to your "components" folder in your working tree. It should be much faster now in your IDE to switch between the two folders.

To see your stories, go to: `https://[yourapp]/stories`. EASY!

### Markdown

As of version >= 1.0.2, the stories can now be written in markdown. This package ships with a "Markdown" component that is enabled by default. To use it, just wrap any of your stories with the `<markdown></markdown>`. For example:

```
<template>
  <client-only>
    <markdown>
      # This is a heading

      ## This is a sub-heading

      ### Here are some bullets:

      * Bullet 1
      * Bullet 2

      ### Here is a component:

      (You can specify the Vue component just like you normally do!)
      <logo></logo>

      Text can be bolded with HTML ```<b></b>``` tags: <b>BOLD</b> text

      Or we can use markdown with double asterisks: **BOLD** text
    </markdown>
  </client-only>
</template>
```

If you already have a markdown component that you use and would like to avoid name conflicts with "markdown", you can disable the registration of this component with `{ markdownEnabled: false }` module option.