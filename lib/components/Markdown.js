import { h } from 'vue'
import Markdown from '../utils/markdown.js'
export default {
  data () {
    return {}
  },
  render () {
    return h('div')
  },
  async mounted () {
    const content = await fetch(this.$attrs.src)
      .then(res => res.text())
    const { compiled } = Markdown.parse(content)
    this.$el.innerHTML = compiled
  }
}
