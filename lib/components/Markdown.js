import Markdown from '../utils/markdown.js'
export default {
  data () {
    return {}
  },
  render (h) {
    const children = [h(this.compiledVue)]
    return h('div', children)
  },
  async mounted () {
    const content = await fetch(this.$attrs.src)
      .then(res => res.text())
    const { compiled } = Markdown.parse(content)
    this.$el.innerHTML = compiled
  }
}
