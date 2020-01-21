[![npm](https://img.shields.io/npm/v/nuxt-stories)](https://www.npmjs.com/package/nuxt-stories)
[![npm](https://img.shields.io/npm/dt/nuxt-stories)](https://www.npmjs.com/package/nuxt-stories)
[![](https://gitlab.com/richardeschloss/nuxt-stories/badges/master/pipeline.svg)](https://gitlab.com/richardeschloss/nuxt-stories)
[![](https://gitlab.com/richardeschloss/nuxt-stories/badges/master/coverage.svg)](https://gitlab.com/richardeschloss/nuxt-stories)
[![NPM](https://img.shields.io/npm/l/nuxt-stories)](https://github.com/richardeschloss/nuxt-stories/blob/development/LICENSE)

# nuxt-stories

> Nuxt stories module -- Painless storybooking for Nuxt

Current status: Works ok for me pretty well, but usage over time will help dictate our needs of this module. Some brainstorming notes are at the bottom.

Update in 0.0.10: Added stories.plugin.js to the package.json (important fix..)
Update in 0.0.9: A toggle button has been added to make it easy to show / hide the stories navbars. Now it's easier to use on both desktop and mobile platforms.
Update in 0.0.8: The "root" .vue file will be the first .vue file found in the stories folder. By default, this is ".stories/index.vue". 

See it in ACTION: [DEMO](https://nuxt-stories.netlify.com) (Ctrl+Click for new tab)

## Introduction

Much respect goes to storybookjs. I really like their idea, however, when it came time to using storybook with Nuxt, I found myself running into several roadblocks and problems that this module intends to solve:

1. I needed to maintain a separate config in the .storybook folder, when I would have preferred to just maintain config in one place: nuxt.config
2. It would require a separate 'npm run' command, so if I had my nuxt app running in dev mode, it meant that every time I wanted to design components in isolation, I had to run storybook, instead of just going to my "storybook routes"
3. Sometimes I wanted to make use of Nuxt plugins, modules, and Vuex while designing components (use cases to be saved for future discussion), but because the storybook environment was isolated, I couldn't easily tap into the Nuxt features I needed. It would require either ugly hacks to config or a lot of extra work that I didn't want to be bothered it. Since storybooking is something I would plan to do for all professional projects, I can't afford to spend too much time fighting the tool and redoing configs. Plus, if I happened to be super smart and figure the config out once, good luck if I could remember all those steps for the next project several months later.
4. The AH HA moment! NUXT _already_ provides you all the tools you need to build a storybook quickly that works alongside your app really nicely! Just EXTEND THE ROUTES when in dev mode only! Then just navigate to those routes! EASY!

## Installation

1. Pre-reqs: (note: these should have already been installed if you used create-nuxt-app, but if in doubt, re-run)

   > npm i -D glob pify @nuxt/utils

2. This module: (note: this will also install gently-copy which is used by the postinstall script. It will also install vue-bootstrap to ensure sample stories are styled correctly)
   > npm i -D nuxt-stories

## Post-installation (automatic)

Be aware, post install, the postinstall script will try to create a `.stories` directory and copy in a few example stories to get you started asap.

## Configuration

In your `nuxt.config.js` file, just specify `nuxt-stories` as one of your `buildModules`. It will only be enabled if your environment is development OR if you specify `forceBuild: true`. There might be times where you want to host the app as a static site so that you can also share the stories. However, normally in production, you probably wouldn't want to package them.

```
...
buildModules: [
  [ 'nuxt-stories', { forceBuild: false } ]
]
...
```

## Usage (EASY!)

When you first install the module, the folder `.stories` should be created with example stories in it. This folder is treated exactly like your pages folder, except that your stories go in this one. Routes are auto-created using the same `createRoutes()` utility that Nuxt uses to create your pages routes, so you can structure your stories similarly. To avoid conflicting with any real routes that might be named "stories", the story routes will start at ".stories". In addition, you might find it useful in your workflow to have the ".stories" really close to your "components" folder in your working tree. It should be much faster now in your IDE to switch between the two folders.

To see your stories, go to: `https://[yourapp]/.stories`. EASY!

### Markdown

As of version >= 1.0.2, the stories can now be written in markdown. This package ships with a "Markdown" component that is enabled by default. To use it, just wrap any of your stories with the `<markdown></markdown>`. For example:

```
<template>
  <client-only>
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
  </client-only>
</template>
```

If you already have a markdown component that you use and would like to avoid name conflicts with "markdown", you can disable the registration of this component with `{ markdownEnabled: false }` module option.

## Deploying stories to a static site:

From my experience, it seems that of github, gitlab, and netlify, netlify was the easiest one to deploy to. Just drag-and-drop the dist folder and it works. If you can fully own the hosting, even better! There are only a few small steps to follow:

1. Force the build of stories:

```
...
buildModules: [
  [ 'nuxt-stories', { forceBuild: true } ]
]
...
```

Other options include: (see `nuxt.config` in `gh-pages` branch for example usage)
- `storiesDir`: if your stories directory relative to src directory (omit the "/" prefix). Default to ".stories"
- `storiesAnchor`: where you want the stories routes to start (defaults to whatever storiesDir is)

2. Tell Nuxt to include the .stories routes: (only needed if you want to create a .stories/index.html file. See NOTES below for known quirks and workarounds)

```
...
generate: {
    routes: ['/.stories']
  }
...
```

3. Remember to disable the caching of builds, if you do so: (skip if you don't)

```
...
build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {},
    parallel: false,
    cache: false,
    hardSource: false
  },
...
```

4. Generate your static site:
   > npm run generate # i.e., nuxt generate

## Build Setup

```bash
# install dependencies
$ npm run install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm run start

# generate static project
$ npm run generate
```

## Todo Items and Notes

- KNOWN QUIRK with static deploys:

1. Static deploys running off the `http-server` node module work perfectly!
2. Github and Gitlab can host the app ok, but can't seem handle the routing correctly (my guess is it treats "." prefixed files as hidden?). Routing works pretty well on Netlify the best. However, you have to navigate to the _app_ first and then route to the ".stories" routes. My guess is they also treat the ".stories" folder as hidden, because when I try to download the artifacts I upload, it doesn't include the .stories :(. All this means is that while you can easily navigate to your .stories _through_ the app, it means you can't navigate directly to the "/.stories" route in your browser's URL box and can't click browser refresh button :(. However, based on how the stories routing works, there shouldn't ever be a need to click browser refresh (hopefully!); ideally, components would send AJAX requests to refresh their data. (if there's a better static hosting solution, I'm all ears!)
--> OK UPDATE 11/01/2019: when in doubt, just see the `gh-pages`. The config used there is what was used to create the pages at nuxt-stories.netlify.com. There, it defintely seemed that changing ".stories" to "stories" unhid the files and allowed for easier redirecting / refreshing. Just remember to use good names for the "stories" routes to avoid conflicting with any pages routes that might also be named "stories".

- I think I can do better with the sidebar navigation. It currently only auto-generates for 2 levels of stories. Not sure how clean it can be when the depth gets insanely large though :/.
--> UPDATE: Ok, the more I thought about this, I think something like "story themes" belong in its own repo. The goal of this module is to remain tiny and fast. While the sample stories can be made more exciting, I think the excitement belongs in a separate project. Ideally, there would be a good number of themes that people can just pull as desired, without bloating this repo. 

- May want to have a nuxt-stories store in Vuex, that's only enabled when the buildModule is being used. Not sure yet.
- Might want to have the main content set as a tabbed-view? One tab for components, another for tests? (to be thought out...)
- [Someday, requires a bit more thought] Provide a right pane that allows people to jot down specs alongside their stories. The idea would be to auto-save those notes as they are typed in on the UI.

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
