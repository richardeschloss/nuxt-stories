---
title: Importing Scripts
order: 3
script:
- /Example1.js
- "https://unpkg.com/moment@2.29.1/moment.js"
- _: https://unpkg.com/lodash@4.17.20/lodash.js
arr:
- { name: John, age: 22 }
- { name: Jill, age: 46 }
---

# Importing Scripts (.js)
Scripts can be quickly fetched and added globally through `frontMatter.script` entries. The entries can either be URLs or alias-to-URL maps. It is still advised to import ES modules whenever possible, since that's where the JS ecosystem is headed, but this feature is still provided anyway.

The entries are treated as follows:
* If the entry is a URL, the script is fetched from that URL, and that script name is used as the property name to attach to the window. 
* If the entry is a alias-to-URL map, the script is fetched and the provided alias is used instead.

## Examples
The `frontMatter.script` for this is:
```
script:
- /Example1.js
- "https://unpkg.com/moment@2.29.1/moment.js"
- _: https://unpkg.com/lodash@4.17.20/lodash.js
```

And this will result in: Example1.js, moment.js, and lodash.js being fetched, and then available in the story as Example1, moment, and _.  (Example1.js defines window.Example1, moment.js defines window.moment and _ is mapped to window.lodash)

<div v-if="!$fetchState.pending">
  We can use the method `Example1.hello` method: <br />
  {{ Example1.hello('hi ') }}
  <br /><br />

  We can use `moment`:<br />
  {{ moment() }}

  We can use one of lodash's methods (`_.find`):<br />
  Find Jill
  {{ _.find(arr, { name: "Jill" }) }}
</div>

Of course, today, a lot of these methods are now built-in to the language. This is merely to show basic working examples

## Caveats

Script elements get added to the DOM to include the scripts. Make sure you trust the source of the script and the script itself. It may be wise to be in "edit" mode to edit the `frontMatter.script` information to temporarily pause the compilation. Only resume the compilation when `frontMatter.script` contains the entries you trust. 

# How It Works
0. Only if the `frontMatter.script` section has changed, perform the next steps, otherwise do nothing.
1. For each entry in `frontMatter.script`, build a queue of alias-to-URL entries. If window[alias] already exists, do not add the entry to the queue.
2. For each entry in the queue, build a script element with id = nuxt-stories-script-[alias] and the src set to the URL. 
3. Attach an "onload" method to this element to signal when the script element as been loaded.
4. Add this script element to the DOM head.
5. After each script element has loaded, assign Vue.prototype[alias] to window[alias] for each script element. Resolve after all scripts have loaded.

