---
title: Deploying
order: 4
---

# Deploying stories to a static site:

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
