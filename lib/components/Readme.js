import { h } from 'vue'
import Markdown from './Markdown.js'
export default {
  render () {
    return h(Markdown, {
      class: 'text-start',
      id: 'readme',
      src: '/nuxtStories/README.md'
    })
  }
}
