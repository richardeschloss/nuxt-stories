import Markdown from './Markdown.js'
export default {
  props: {
    compileVue: {
      type: Boolean,
      default: false
    }
  },
  render (h) {
    return h(Markdown, {
      staticClass: 'text-start',
      attrs: {
        id: 'readme',
        src: '/nuxtStories/README.md',
        compileVue: this.compileVue
      }
    })
  }
}
