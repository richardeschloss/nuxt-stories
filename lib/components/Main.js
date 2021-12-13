export default {
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
          }
        }
      }),
      h('NuxtStoriesToc', {
        attrs: {
          story: this.activeStory,
          activeHdr: this.activeHdr
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
      scrollTo: {}
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