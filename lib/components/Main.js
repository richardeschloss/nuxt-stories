export default {
  render (h) {
    if (!this.activeStory) { return h() }
    return h('main', {
      staticClass: 'bd-main order-1'
    }, [
      h('NuxtStoriesBreadcrumbs', {
        attrs: {
          story: this.activeStory
        }
      }),
      h('NuxtStoriesContent', {
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
      h('NuxtStoriesToc', {
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
