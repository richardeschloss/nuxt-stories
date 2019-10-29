# nuxt-stories

> Nuxt stories module -- Painless storybooking for Nuxt

Current status: bleeding-edge. Works ok for me, but may not be ready for primetime yet.

## Introduction

Much respect goes to storybookjs. I really like their idea, however, when it came time to using storybook with Nuxt, I found myself running into several roadblocks and problems that this module intends to solve:

1. I needed to maintain a separate config in the .storybook folder, when I would have preferred to just maintain config in one place: nuxt.config
2. It would require a separate 'npm run' command, so if I had my nuxt app running in dev mode, it meant that every time I wanted to design components in isolation, I had to run storybook, instead of just going to my "storybook routes"
3. Sometimes I wanted to make use of Nuxt plugins, modules, and Vuex while designing components (use cases to be saved for future discussion), but because the storybook environment was isolated, I couldn't easily tap into the Nuxt features I needed. It would require either ugly hacks to config or a lot of extra work that I didn't want to be bothered it. Since storybooking is something I would plan to do for all professional projects, I can't afford to spend too much time fighting the tool and redoing configs. Plus, if I happened to be super smart and figure the config out once, good luck if I could remember all those steps for the next project several months later.
4. The AH HA moment! NUXT _already_ provides you all the tools you need to build a storybook quickly that works alongside your app really nicely! Just EXTEND THE ROUTES when in dev mode only! Then just navigate to those routes! EASY!

## Installation

> npm i -D nuxt-stories

## Post-installation (automatic)

Be aware, post install, the postinstall script will try to create a `.stories` directory and copy in a few example stories to get you started asap.

## Configuration

In your `nuxt.config.js` file, just specify `nuxt-stories` as one of your `buildModules`. It will only be enabled if your environment is development OR if you specify `forceBuild: true`. There might be times where you want to host the app as a static site so that you can also share the stories. However, normally in production, you probably wouldn't want to package them.

```
...
buildModules: [
  'nuxt-stories', { forceBuild: false }
]
...
```

## Usage (EASY!)

When you first install the module, the folder `.stories` should be created with example stories in it. This folder is treated exactly like your pages folder, except that your stories go in this one. Routes are auto-created using the same `createRoutes()` utility that Nuxt uses to create your pages routes, so you can structure your stories similarly. To avoid conflicting with any real routes that might be named "stories", the story routes will start at ".stories". In addition, you might find it useful in your workflow to have the ".stories" really close to your "components" folder in your working tree. It should be much faster now in your IDE to switch between the two folders.

To see your stories, go to: `http://[yourapp]/.stories`. EASY!

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

- I think I can do better with the sidebar navigation. Perhaps it can be an accordian that drills down into children.
- May want to have a nuxt-stories store in Vuex, that's only enabled when the buildModule is being used. Not sure yet.
- [Someday, requires a bit more thought] Provide a right pane that allows people to jot down specs alongside their stories. The idea would be to auto-save those notes as they are typed in on the UI.
- Automated tests would be nice

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
