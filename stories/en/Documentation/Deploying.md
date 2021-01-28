---
title: Deploying
order: 5
---

# Deploying stories to a static site:

1. Force the build of stories:

```js
...
buildModules: [
  [ 'nuxt-stories', { forceBuild: true } ]
]
...
```

2. Tell Nuxt to include the "stories" routes: 

```js
async function staticRoutes () {
  const { promisify } = require('util')
  const Glob = require('glob')
  const glob = promisify(Glob)
  const files = await glob('./stories/**/*.{vue,js,md}')
  const routes = files
    .map(f => f
      .replace('./', '/')
      .replace(/(.js|.vue|.md)/, ''))

  return routes
}

...
generate: {
  dir: 'public', // if generating to "public" folder
  routes () { 
    return staticRoutes()
  }
}
...
```

NOTE: as of Nuxt 2.14, the nuxt generate script should automatically create the routes for you and eliminate the need for specifyig the `generate.routes` options. However, from my experience, I have found that while locally serving the static routes works fine with `generate.routes` omitted, it is still needed on Netlify, should you choose to deploy there. (from my findings, if you omit the routes options here, you won't be able to go to the routes directly in the browser, only through the app from the route root.)

3. Remember to disable the caching of builds, if you do so: (skip if you don't)

```js
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
4. Define your generate script in package.json: (the stories need to be copied into the generated folder)

```js
"scripts": {
  "generate": "nuxt generate && mkdir -p public/markdown && cp -rf stories/* public/markdown",
}
```

(if you specified "public" as the generated folder. Otherwise, it would default to "dist" if you didn't specify it)


5. Generate your static site:
```bash
npm run generate # i.e., nuxt generate
```
