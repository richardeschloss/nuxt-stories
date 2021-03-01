---
title: Importing ESM
order: 1
esm:
- /Example2.mjs
- SimpleCart, named1 as n1: /Example2.mjs
- /Example4.js
---

# Importing ESM (.mjs)

Most modern browsers support importing absolute URLs, and a modern browser must be used for the import to work correctly. To import ES modules (.mjs or .js files that use the ESM syntax), the `frontMatter.esm` property needs to be defined and formatted as an array of either URLs or importName-to-URL map entry. In fact, the importName-to-URL map entry is exactly what you would type in your import statements in an ESM file (nuxt-stories merely slaps curly braces around your entry, so "as [alias]" will also work). 

If the entry is a URL, then all scripts in that file will be imported as the script name. If the entry is an importName-to-URL map, then the named imports will be imported from the specified URL, provided the module at that URL exports those names. Again, if "as [alias]" is provided, the import will be available to work with as that alias. 

All the fetching is performed in Nuxt's fetch hook, so it's advised to check `$fetchState.pending` before attempting to work with the imports.

## Examples
<div v-if="!$fetchState.pending">
<json :data="Example2" />

{{ Example2.fn2() }}

{{ n1() }}

<json :data="SimpleCart" />

</div>

## Caveats

# Importing Vue (.mjs)

## Examples
<Example4 />

{{ Example4 }}

# How it works
