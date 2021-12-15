import Markdown from '../utils/markdown.js'
import Vue from 'vue/dist/vue.common.js'

export default {
  props: {
    compileVue: {
      type: Boolean,
      default: false
    }
  },
  data() {
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
