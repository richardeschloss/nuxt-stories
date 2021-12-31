import Breadcrumbs from './Breadcrumbs.js'
import Content from './Content.js'
import Toc from './Toc.js'

export default {
  render (h) {
    if (!this.activeStory) { return h() }
    return h('main', {
      staticClass: 'bd-main order-1'
    }, [
      h(Breadcrumbs, {
        attrs: {
          story: this.activeStory
        }
      }),
      h(Content, {
        attrs: {
          story: this.activeStory
        },
        on: {
          activeHdr: (info) => {
            this.activeHdr = info
          },
          viewerScrolling: (viewerScrolling) => {
            this.viewerScrolling = viewerScrolling
          }
        }
      }),
      h(Toc, {
        attrs: {
          story: this.activeStory,
          activeHdr: this.activeHdr,
          viewerScrolling: this.viewerScrolling
        }
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
      return this.$store.state && this.$store.state.$nuxtStories
        ? this.$store.state.$nuxtStories.activeStory
        : null
    }
  }
}
