export default {
  props: {
    compileVue: {
      type: Boolean,
      default: false
    }
  },
  render(h) {
    return h('NuxtStoriesMarkdown', {
      staticClass: 'text-start',
      attrs: {
        id: 'readme',
        src: '/nuxtStories/README.md',
        compileVue: this.compileVue
      }
    })
  }
}