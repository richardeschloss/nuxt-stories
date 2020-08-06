---
title: Deploying
order: 4
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
...
generate: {
  routes: ['/.stories'],
  dir: 'public' // if generating to "public" folder
}
...
```

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
