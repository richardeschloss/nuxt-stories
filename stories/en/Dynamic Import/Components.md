---
title: NewStory2
order: 4
components: 
- E3: /Example3.vue
- /Example3.vue
---

# Importing Components (.vue, .mjs)

It is possible to import Vue components that reside anywhere in the world. However, if those Vue components have dependencies, those dependencies need to be specified as well, since nuxt-stories does not perform any dependency management.

This feature is similar but different to the "Import ESM" feature in that components are first downloaded to the workspace and then auto-imported when the hot module reloader detects the filesystem changes and reloads. While the import in this manner is a little slower than the "Import ESM" feature, it allows one to specify both .js and .vue files, and to import Vue components that import node_modules dependencies. 

For each entry in `frontMatter.components`, each entry is either a URL or an alias-to-URL map. For each URL, the components are downloaded to [projectRoot]/components/nuxtStories. If the components folder is being watched (i.e., not in .nuxtignore), the download will trigger a hot module reload after which the downloaded components will be available to work with by their registered name.

## Examples
In the above frontMatter we have:
```
components: 
- E3: /Example3.vue
- /Example3.vue
```

This means that /Example3.vue will be downloaded, and that two identical components will be registered, just named differently: E3 and Example3. Each of these components will have their own state:

E3:
<E3 />

Example3:
<Example3 />

## Caveats

Since the Vue components are now being bundled in webpack, if those components use absolute URLs, those components will fail to load. So, you lose that advantage, but you get components neatly in your workspace, without having to manipulate the DOM.

# How it works

0. Only if the `frontMatter.components` information changes do the next steps take place. Otherwise, nothing happens.
1. For each entry, create alias-to-URL mappings and pass info along to the "backend for frontend".
2. Fetch the URLs and stream to destinations creating the alias names. 
3. When the file streaming finishes, the app should reload with the autoImport script using require.context to consume and register the newest components.


