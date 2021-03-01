---
title: Dynamic Import
order: 2
---

# Dynamic Import

As of v.2.0.14, there is now a dynamic import feature that will be disabled by default, and enabled by setting `cfg.dynamicImport` in nuxt.config. Since the feature relies on fetching remote scripts, `cfg.fetch` also needs to be enabled for the feature to work.

The feature will allow you to *instantly* import ESM modules, Vue components and include JS scripts that reside anywhere in the world. All you need to do is provide the url(s) in the frontMatter, and like magic, you'll be able to use the functionality those scripts give you. All without having to `npm install` anything. 

Please be advised that any time you import anything into your application, especially on-the-fly, there is a risk associated with that: you have to trust the source and the script your are importing. Please take care in balancing the level of speed and risk you wish to take on. 

Read the sub-menu items in to learn more.