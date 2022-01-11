import { h } from 'vue'
import Breadcrumbs from './Breadcrumbs.js'
import Content from './Content.js'
import Toc from './Toc.js'

export default {
  render () {
    if (!this.activeStory) { return }
    return h('main', {
      class: 'bd-main order-1'
    }, [
      h(Breadcrumbs, { story: this.activeStory }),
      h(Content, {
        story: this.activeStory,
        onActiveHdr: (info) => {
          this.activeHdr = info
        },
        onViewerScrolling: (viewerScrolling) => {
          this.viewerScrolling = viewerScrolling
        }
      }),
      h(Toc, {
        story: this.activeStory,
        activeHdr: this.activeHdr,
        viewerScrolling: this.viewerScrolling
      })
    ])
  },
  data () {
    return {
      activeHdr: '',
      viewerScrolling: false
    }
  },
  computed: {
    activeStory () {
      return this.$nuxtStories().value?.activeStory
    }
  }
}
