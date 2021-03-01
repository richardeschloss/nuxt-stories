---
title: Importing NPM
order: 2
npm:
- filter as f, min, max: lodash-es
---

# Importing NPM
It is also possible to import ES modules that exist in npm, simply referring to them by name. This is an extension of the previous section, with the main difference being: instead of providing a URL, you provide the npm package name, and the main script is resolved using jsdelivr's API. 

## Examples 
In the `frontMatter.npm`, there is the following entry:
```
npm:
- filter as f, min, max: lodash-es
```

Here, "lodash-es" is specified instead of "lodash" because "lodash-es" is written as an ES module with exports we can import. Plain "lodash" attempts to attach to the global window object (and that example is shown in the "Scripts" section). 

The entry gets translated as:
* import { filter as f, min, max } from "https://cdn.jsdelivr.net/npm/lodash-es@4.17.21/lodash.min.js"

The "@[version]" specifier is also respected. So the following would pull from the older version:
```
npm:
- filter as f, min, max: lodash-es@4.17.15
```

Something like this could make debugging and comparing versions of the same package easier:

```
npm:
- filter as fOld: lodash-es@4.17.15
- filter as fBroken: lodash-es@[brokenVersion]
// --> compare fBroken to fOld behavior
// right in the story
```

Going back to the entry we have defined for this story, this is the result: (make sure to be in "split" mode to compare the input and output)
<div v-if="!$fetchState.pending">
  Max: {{ max([4,44,3,3]) }}

  Filter: {{ f([{a: 1}, {a: 1}, {a: 2}], {a:1})}}
</div>

## Caveats

1. This feature relies on jsdelivr's API to resolve the script names in npm. Make sure you trust jsdelivr.
2. Remember that when you are in "split" mode, whatever you type gets compiled. So as you type the frontMatter.npm entries, you may not want to retrieve any scripts until you have finished typing the entries. For example, if in the frontMatter.npm entry, you start typing "- filter as f: lo", and then "- filter as f: lod", you don't want requests to be made for "lo" and "lod", but only for "lodash-es". Therefore, it's a good idea to be in "edit" mode to pause the compilation, and only toggle out when you are sure of your entries.

# How it works
This feature basically extends the ESM importing feature. First, the jsdelivr API is used to resolve the npm names to full URLs. For each entry, aliases, versions, and urls are then fed to the ESM importer script, which will have the combined information from `frontMatter.npm` and frontMatter.esm`. 
