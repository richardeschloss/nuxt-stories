export default {
  render(h) {
    return h('NuxtStoriesMarkdown', {
      staticClass: 'text-start',
      attrs: {
        id: 'readme',
        src: '/nuxtStories/README.md',
        compileVue: true
      }
    })
  }
}