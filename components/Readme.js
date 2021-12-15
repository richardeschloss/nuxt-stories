export default {
  render(h) {
    return h('NuxtStoriesMarkdown', {
      attrs: {
        src: '/README.md',
        compileVue: true
      }
    })
  }
}