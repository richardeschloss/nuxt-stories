---
title: Dynamic Import
order: 2
---

# Dynamic Import

As of v.2.0.14, there is now a dynamic import feature that will be disabled by default, and enabled by setting `cfg.dynamicImport` in nuxt.config. Since the feature relies on fetching remote scripts, `cfg.fetch` also needs to be enabled for the feature to work.

`nuxt.config`
```js
{
  stories: { // required config
    fetch: true, // enabled by default
    dynamicImport: true // disabled by default
  }  
}
```

The feature will allow you to *instantly* import ESM modules, Vue components and include JS scripts that reside anywhere in the world. All you need to do is provide the url(s) in the frontMatter, and like magic, you'll be able to use the functionality those scripts give you. All without having to `npm install` anything. In addition, depending on how static assets are served, you may be able to take advantage of browser caching; that is, requests for scripts will usually be cached by the browser, and only re-requested if the URL changes, for example, if a query parameter changes. 

However, it is important to understand that with benefits, there are also caveats. There is no dependency management or tree-walking of any kind. The scripts you specify are the scripts you get. Nothing more. You only get those scripts dependents if those scripts use absolute URLs and/or relative paths, since that's what the browser requires. Because of how browser imports work, statements like 'import jQuery as $ from "jquery"' on their own will fail because the "jquery" will be an unresolved path. In fact, any time you've seen that work, it was actually your bundler, such as webpack, taking care of the module resolution for you (mapping those names to the dependents in "node_modules" folder).

Please be advised that any time you import anything into your application, especially on-the-fly, there is a risk associated with that: you have to trust the source and the script your are importing. Please take care in balancing the level of speed and risk you wish to take on. 

Read the sub-menu items in to learn more.

## Suggested Reading

* [ES modules: A cartoon deep-dive by Lin Clark](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)