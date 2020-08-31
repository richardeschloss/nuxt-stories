---
  title: Components
  order: 3
---

Your stories can be entirely prose, or entirely functional!  The nuxt-stories module will auto scan two directories and auto import components:

- nuxt-stories/lib/components (these are internal components, used for this UI):
  - For example: 
  <stories-logo />
  - Another example:
  <stories-header />

- [project root]/components
  - For example:
  <hello />

So, the `<hello />` component is just a dummy component included in this project. Nothing fancy. 

Usually, writing components down like this and then feeding those components data is an easy way to see how things work instantly. 