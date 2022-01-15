---
title: Usage
order: 3
---

# Usage

By default, nuxt-stories will look in [appRoot]/stories/[default language] folder. You can put stories there and then see them on the UI! Or, you can just click the ADD STORY button on the UI! Your choice!

### Try it!

Click the "split" button above and watch your changes asap!

Write some markdown:
* item 1
* item 2

Write a vue component:
<NuxtStoriesLogo />

See compilation in action, by removing the tick marks below:
`<NuxtStoriesLogo />`

## Folder structure

Stories are organized in a similar fashion as your Nuxt *pages*, since the same "createRoutes()" function is used. Specifically, the structure is as follows:

- [app root]/
  - [`storiesDir`; default: "stories"]
    - [`lang`; default: "en"]
      - story1.md // Markdown file
      - story1 // folder to contain story1's children

To see that everything got setup correctly, you should be able to see the sample stories at: http://localhost:3000/stories (default).

Whenever in doubt, just look at this github repo! These hosted docs use that directly so you know the repo will have working code!

### Markdown first

This approach means the stories will take a "Markdown first", which I think is extremely powerful. Markdown, in my opinion, is a format that allows one to *write* ideas much faster than *markup*. It feels more natural, but we still want to see compiled *markup* because it's, cleaner, visually appealing, and functional. Plus, with "Markdown first", we can write *frontmatter* and then use that data for our Vue components really easily. 

Here's how to do with the module. Drilling down into the "index" folder, the structure looks like this:

- story1.md // md file
- story2.md // md file
- story2 // folder, if story2 has children
  - child1.md 
  - child2.md  

From this, the following routes will be extended from your existing app routes:
- /stories/story1
- /stories/story2
- /stories/story2/child1
- /stories/story2/child2

At any time you need to change the ordering of the stories, you do so by defining the "order" property in the markdown (scroll to the top of this story "Usage" in "edit mode" to see how the frontmatter is formatted). 

## Some notes

1. At any time you wish to pause the instant compilation, simply switch to "edit mode" by clicking the pencil icon in the top togglebar. Clicking back to either "split" or "view" mode will re-enable the instant compilation.
1. Since the UI is allowing you to do live editing and real-time compiling, there is technically a lot of rule-breaking going on, but it's ok, because this is simply a *dev tool* primarily used *locally*. Expect to see console log statements going haywire. As you type, naturally, compilation will fail as the component name is incomplete. My best recommendation is to temporarily mute console errors, or disable the "error" log level in dev tools.
1. To get code syntax highlighting to work, don't forget to include the code language
 identifier:

Highlighted (with "js"):
```js
var str = "Hi, I'm highlighted :)"
```

Not highlighted:
```
var str = "Hi, I'm not highlighted :("
```

And lastly, at any time you don't like the UI...it's ok! You're a developer and you're not locked in to using my design! You can tweak it as you need!
1. dompurify is included as a dependency, but is commented out in the markdown utils since it interferes with the live-editing. This shouldn't be an issue for local development purposes only. You may wish to uncomment the lines in the utility if you think you'll need to sanitize the input.

