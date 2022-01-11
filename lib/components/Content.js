import { h } from 'vue'
import Editor from './Editor.js'
// import Viewer from './Viewer.js'

export default {
  props: ['story', 'scrollTo'],
  data () {
    return {
      viewerScrollTop: 0
    }
  },
  render () {
    const children = []
    const editor = h(Editor, { story: this.story })
    // const viewer = h(Viewer, {
    //   story: this.story,
    //   onActiveHdr: (info) => {
    //     this.$emit('activeHdr', info)
    //   }
    // })
    let gridTemplateColumns = '1fr'
    if (this.viewMode === 'edit') {
      children.push(editor)
    } else if (this.viewMode === 'view') {
      // children.push(viewer)
    } else {
      gridTemplateColumns += ' 1fr'
      // children.push(editor, viewer)
    }
    return h('div', {
      class: 'bd-content',
      style: {
        display: 'grid',
        'grid-template-columns': gridTemplateColumns
      }
    }, children)
  },
  computed: {
    viewMode () {
      return this.$nuxtStories().value?.viewMode
    }
  }
}
