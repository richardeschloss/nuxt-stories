---
title: Usage
order: 3
---

# Usage

After you first install `nuxt-stories`, remember a postinstall script will run to gently copy over the following:

* stories to "stories" dir
* stories layout "stories" to "layouts" dir
* stories assets (css/scss/svg) to your "assets" dir

If a "components" directory does not already exist, it will be created in your project root.

### Try it!

Click the "split" button above and watch your changes asap!

Write some markdown:
* item 1
* item 2

Write a vue component:
<stories-logo />

See compilation in action, by removing the tick marks below:
`<stories-logo />`

## Folder structure

Stories are organized in a similar fashion as your Nuxt *pages*, since the same "createRoutes()" function is used. Specifically, the structure is as follows:

- [app root]/
  - [`storiesDir`; default: "stories"]
    - [`lang`; default: "en"]
      - index.vue // stories root. don't change...
      - index // folder to contain the children"

Inside of the "index" folder is where you really maintain your stories. You have two approaches for writing stories: 1) Vue-in-Markdown (new way), and 2) Markdown-in-Vue (legacy) and 3) Rough combination of the two. These docs are using the new way, and, in my opinion, make life far easier. The legacy way still exists in case you need it.

To see that everything got setup correctly, you should be able to see the sample stories at: http://localhost:3000/stories (default).

Whenever in doubt, just look at this github repo! These hosted docs use that directly so you know the repo will have working code!

### Markdown-first / Vue-in-Markdown

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

### Vue-first / Markdown-in-Vue

It's possible you will want a "Vue-first" approach instead to writing your stories, since you will have more control over styling.

The folder structure is very similar to the previous approach:

- story1.vue // vue file
- story2.vue // vue file
- story2 // folder, if story2 has children
  - child1.vue 
  - child2.vue  

From this, the following routes will be extended from your existing app routes (just like before):
- /stories/story1
- /stories/story2
- /stories/story2/child1
- /stories/story2/child2

However, since you are now creating your stories the same way you create your Nuxt pages (i.e., "Vue first"), it now lies on you to include the `<nuxt-child></nuxt-child>` wherever you plan to have to story children! So, in the above example, story2.vue would need to have the nuxt child tag. In my opinion, this is not a development experience I enjoy, but if you're used to it, you might not mind it.

As of version >= 1.0.2, a markdown wrapper component ships with the package that makes it easy to compile markdown. To use it, just wrap any of your stories with the `<markdown></markdown>`. For example:

```html
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
```

## Using the UI

### Some notes
First understand, with the current UI, there are some features that have been implemented, others that are simply acting as placeholders: the search box, language selector, user selector are all just placeholders. Everything else is operational to spec.

Also note, at the top, the stories header contains toggle buttons for selecting the view mode of the stories: "view" / "edit" / "split". These buttons only work for the "Markdown-first" stories, and there is no plan to make them work for the old way. The toggle button was inspired by h-wiki's front end.

For the editing feature to work, the Nuxt app has to have the server running, since nuxt-stories will make api calls to the server-side code (so that the changes can be made back to your filesystem). 

### Write your first story

Again, live-editing on the UI only works for the ".md" files. For the ".vue" files, you have to edit those in your IDE. 

Click on any of the ".md" stories and toggle the view mode to either "edit" or "split" if you want to see the changes right away. If you are on your local machine running in dev mode, you'll see the changes also getting saved back to your filesystem. In VS code for example, you should actually see the code changes *instantly*. 

You can try writing markdown or vue-in-markdown to see it in action:

For example, here is a list:
* item 1
* item 2

And here is a the nuxt-stories logo:
<stories-logo /> ... tada!

### Important notes

1. At any time you wish to pause the instant compilation, simply switch to "edit mode" by clicking the pencil icon in the top togglebar. Clicking back to either "split" or "view" mode will re-enable the instant compilation.
1. Since the UI is allowing you to do live editing and real-time compiling, there is technically a lot of rule-breaking going on, but it's ok, because this is simply a *dev tool* primarily used *locally*. Expect to see console log statements going haywire. As you type, naturally, compilation will fail as the component name is incomplete. My best recommendation is to temporarily mute console errors, or disable the "error" log level in dev tools.
1. The table-of-contents on the right only gets updated for "Markdown first" stories. 
1. The table-of-contents "scrollspy" feature that highlights the actively viewed story works primarily in "view" mode. 
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

