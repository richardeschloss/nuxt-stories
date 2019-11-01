function nuxtStories() {
  const pluginOptions = <%= JSON.stringify(options) %>

  return Object.freeze({
    options: pluginOptions
  })
}

export default function(context, inject) {
  inject('nuxtStories', nuxtStories)
}
