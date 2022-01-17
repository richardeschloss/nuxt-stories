---
title: Deploying
order: 5
---

# Deploying stories to a static site:

!! NOTE: `nuxt generate` is still being developed for nuxt3 !!

1. Force the build of stories:

```js
...
buildModules: [
  [ 'nuxt-stories', { forceBuild: true } ]
]
...
```

2. Define your generate script in package.json: (the stories need to be copied into the generated folder)

```js
"scripts": {
  "generate": "npm run mkDirs && npm run cpFiles && nuxi generate --verbose",
  "mkDirs": "mkdir -p static/nuxtStories static/nuxtStories/svg",
  "cpFiles": "cp -rf stories/* static/nuxtStories && cp -rf lib/assets/svg/* static/nuxtStories/svg && cp ./README.md ./static/nuxtStories ",
}
```

(if you specified "public" as the generated folder. Otherwise, it would default to "dist" if you didn't specify it)

3. Generate your static site:
```bash
npm run generate # i.e., nuxt generate
```
