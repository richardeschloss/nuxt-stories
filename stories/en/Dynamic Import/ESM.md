---
title: Importing ESM
order: 1
esm:
- /Example2.mjs
- SimpleCart, named1 as n1: /Example2.mjs
- /Example4.js
- default as E4: /Example4.js
- named1Ext: /Example5.js
---

# Importing ESM (.mjs)

Most modern browsers support importing absolute and relative URLs, and a modern browser must be used for the import to work correctly. To import ES modules (.mjs or .js files that use the ESM syntax), the `frontMatter.esm` property needs to be defined and formatted as an array of either URLs or importName-to-URL map entry. In fact, the importName-to-URL map entry is exactly what you would type in your import statements in an ESM file (nuxt-stories merely encapsulates curly braces around your entry, so "as [alias]" will also work). 

If the entry is a URL, then all scripts in that file will be imported as the script name. If the entry is an importName-to-URL map, then the named imports will be imported from the specified URL, provided the module at that URL exports those names. Again, if "as [alias]" is provided, the import will be available to work with as that alias. 

All the fetching is performed in Nuxt's fetch hook, so it's advised to check `$fetchState.pending` before attempting to work with the imports.

## Examples
The frontMatter has 3 entries above. For this one, we'll focus on the first two:
```
esm:
- /Example2.mjs
- SimpleCart, named1 as n1: /Example2.mjs
- /Example4.js
- default as E4: /Example4.js
- named1Ext: /Example5.js
```

The entries get translated as:
* `import * as Example2 from "/Example2.mjs"`
* `import { SimpleCart, named1 as n1 } from "/Example2.mjs"`
* `import * as Example4 from "/Example4.js"` // this is a Vue component, explained in the next section
* `import { default as E4 } from "/Example4.js"` // this is a Vue component, with an alias, explained in the next section
* `import { named1Ext } from "/Example5.js" // this depends on Example4.js

The last entry depends on "/Example4.js", so if "/Example4.js" were missing, that line would fail to import. 

As a result, `Example2`, `SimpleCart`, `n1`, and `named1Ext` will then be available for us to work with in the story like so: (be in "split" mode to see the input vs. output)

<div v-if="!$fetchState.pending">
  <json :data="Example2" />

  {{ Example2.fn2() }}

  {{ n1() }}

  <json :data="SimpleCart" />

  {{ named1Ext() }}
</div>

If Example2.mjs were to have any changes, and we wanted to re-fetch those changes without doing a hard refresh, we could simply do so by appending a query parameter to the URL to invalidate the browser cache:

* If we specified: "/Example2.mjs?v=2" or "/Example2.mjs?t=[timeNow]", we'd retrieve the newer version of Example2. And, if we were to remove that query parameter, we'd retrieve the older version from browser cache very quickly, all without having to perform a relatively slower refresh.

## Caveats

As mentioned in the parent story "Dynamic Import", Example2.mjs can only include absolute or relative URLs, and those resources have to exist. Module names alone do not get resolved by the browser; that kind of name resolution has always been handled for you by your bundler, such as webpack. Hand elpful tip: Also, when working with browser import statements, usually the full filename with the extension has to be provided. 

# Importing Vue (.mjs)

In addition to importing the ESM files into the story, if the ESM exports a default object with a ".render" function, that object will be assumed to be a Vue component and registered as such. The filename will be used as the component name, unless an alias is specified. In that case, the alias will be used as the component name. 

## Examples
Let's look at the relevant ESM entries:

```
esm:
- /Example4.js
- default as E4: /Example4.js
```

It should be known that "/Example4.js" has a default export containing a defined render function. Therefore, in addition to being able to work with Example4's exports, we can also just use the default export as a Vue component. 

So, the first entry means to register "Example4" as a Vue component, and the second one means to register E4 as a Vue component. Both entries specify the same resource, so below, we should see to identical components (but with separate state):

<div v-if="!$fetchState.pending">
Here is "Example4" Vue component:
<Example4 />

Here is "E4" Vue component": (it should look the same as "Example4" but have its own state)
<E4 />
<div>

## Caveats

The Vue components to be imported need to already be .js or .mjs. If they are .vue files, there is no vue-loader here to transpile the file into .js. On the bright-side though, depending on how simple the Vue component is, you may actually find writing, maintaining and testing the component in .js is far easier.

# How it works 

First, the frontMatter is inspected for changes to either frontMatter.esm or frontMatter.npm (npm explained in next section). Only if changes have occurred will the following take place.

1. Construct an importer script by parsing the entries. Append to that script a callback when imports are ready. The callbacks will be a Vuex mutation (to "$nuxtStories/ESMS_FETCHED") and a "modsImported" method attached to the DOM element containing the importer script. The callbacks consume the imports.
2. Find the DOM element with id "nuxt-stories-esm". If it does not exist, create it with its contents set to the importer script. If it does exist, simply replace the element with the updated importer. 
3. Append this importer element to `document.head`. 
