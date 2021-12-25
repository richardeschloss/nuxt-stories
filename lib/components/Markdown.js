import Vue from '../utils/vue.esm.js'
import Markdown from '../utils/markdown.js'

export default {
  props: {
    compileVue: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      compiledVue: null
    }
  },
  render (h) {
    const children = [h(this.compiledVue)]
    return h('div', children)
  },
  async mounted () {
    const content = await fetch(this.$attrs.src)
      .then(res => res.text())
    const { compiled } = Markdown.parse(content)
    if (this.compileVue) {
      this.compiledVue = Vue.compile(`<div>${compiled}</div>`)
    } else {
      this.$el.innerHTML = compiled
    }
  }
}
