export default { // TBD: what events can we scrub away? looking at route hash mainly
  render(h) {
    if (!this.activeStory) return h()
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
          story: this.activeStory,
          scrollTo: this.scrollTo
        },
        on: {
          activeHdr: (info) => {
            this.activeHdr = info
          },
          scrollToId: (info) => {
            this.scrollTo = info
          },
          viewerScrolling: (info) => {
            this.viewerScrolling = info
          }
        }
      }),
      h('NuxtStoriesToc', {
        attrs: {
          story: this.activeStory,
          activeHdr: this.activeHdr,
          viewerScrolling: this.viewerScrolling
        },
        on: {
          scrollToId: (hdrInfo) => {
            this.scrollTo = hdrInfo
          }
        }
      })
    ])
  },
  data() {
    return {
      activeHdr: '',
      scrollTo: {},
      viewerScrolling: false
    }
  },
  computed: {
    activeStory() {
      return this.$store.state && this.$store.state.$nuxtStories
        ? this.$store.state.$nuxtStories.activeStory
        : null
    }
  }
}