[![npm](https://img.shields.io/npm/v/nuxt-stories)](https://www.npmjs.com/package/nuxt-stories)
[![npm](https://img.shields.io/npm/dt/nuxt-stories)](https://www.npmjs.com/package/nuxt-stories)
[![](https://gitlab.com/richardeschloss/nuxt-stories/badges/master/pipeline.svg)](https://gitlab.com/richardeschloss/nuxt-stories)
[![](https://gitlab.com/richardeschloss/nuxt-stories/badges/master/coverage.svg)](https://gitlab.com/richardeschloss/nuxt-stories)
[![NPM](https://img.shields.io/npm/l/nuxt-stories)](https://github.com/richardeschloss/nuxt-stories/blob/development/LICENSE)

[📖 **Release Notes**](https://github.com/richardeschloss/nuxt-stories/blob/master/CHANGELOG.md)

# nuxt-stories

> Nuxt stories module -- Painless (and now insanely fast) storybooking for Nuxt

## Features
* ✅ Insanely fast configuration and usage (one install, one line in config, and you're good to go!)
* ✅ Live markdown editing and previewing directly on the UI! Faster than Hot Module Reloading!
* ✅ Stories that get written on the UI get auto saved back to the filesystem (local dev only)
* ✅ Easily toggle the view mode in the stories header.
* ✅ Instant compiling of vue components as you type them on the UI!
* ✅ Ordering of stories using story frontMatter.
* ✅ Instant updating of table of contents as you type the headers
* ✅ Auto importing of components. Just place components in your components directory and just use them!
* ✅ Vue in Markdown or Markdown in Vue! You're in complete control! (I prefer Vue-in-Markdown ;))
* ✅ Emoji support! Don't believe it? Just look at this bulleted list!
* ✅ The perfect development tool for rapidly jotting down notes, gameplans, or even writing official documentation! Documentation that is also *functional*. 

(Demonstration video placeholder)

## Demo
See it in ACTION: [DEMO](https://nuxt-stories.netlify.com) (Ctrl+Click for new tab)

## Setup

1. Add `nuxt-stories` dependency to your project

```bash
yarn add --dev nuxt-stories # or npm i -D nuxt-stories
```

You may also need to install the following deps if they didn't get installed when you first created your nuxt app:

```bash
npm i -D glob pify @nuxt/utils bootstrap bootstrap-vue dompurify gently-copy gray-matter highlight.js marked nuxt-socket-io node-sass sass-loader
```

After installing, a postinstall script will run to "gently copy" sample stories, assets, and layout(s) to your workspace to get you setup asap.  It will also create a "components" directory if it doesn't already exist.

2. Add `nuxt-stories` to the `buildModules` section of `nuxt.config.js`

```js
{
  buildModules: [
    'nuxt-stories'
  ],
  stories: {
    /* stories options here */
  }
}
```

Also make sure you have Vuex enabled the "Nuxt way", since nuxt-stories will register a vuex module for persisting stories, table of contents and selected view mode. After you install nuxt-stories, a postinstall script will automatically try to create the following for you, if your store hasn't yet been enabled:

store/index.js:
```js
export const state = () => ({})
```

If this already exists, it won't get overwritten.


3. There is no step 3! You're good to go! Try it out!

```bash
npm run dev
```

> Then view your stories running on your local dev server: http://localhost:3000/stories

All the stories that you edit there will get auto saved back to [project root]/stories/[language]. Read on to learn more. More explanation will follow.
