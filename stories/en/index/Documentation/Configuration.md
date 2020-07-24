---
title: Configuration
order: 2
---

## Configuration

In your `nuxt.config.js` file, just specify `nuxt-stories` as one of your `buildModules`. It will only be enabled if your environment is development OR if you specify `forceBuild: true`. There might be times where you want to host the app as a static site so that you can also share the stories. However, normally in production, you probably wouldn't want to package them.

```js
...
buildModules: [
  [ 'nuxt-stories', { forceBuild: false } ]
]
...
```

Alternatively, you can also specify the stories options separately:
```js
...
buildModules: ['nuxt-stories'],
stories: { /* stories options here */ }
...
```

## Options



