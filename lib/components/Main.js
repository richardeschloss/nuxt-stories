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
          viewerScrollTo: this.viewerScrollTo
        }
      }),
      h('NuxtStoriesToc', {
        attrs: {
          story: this.activeStory
        },
        on: {
          scrollToId: (id) => {
            this.viewerScrollTo = id
          }
        }
      })
    ])
  },
  data() {
    return {
      viewerScrollTo: ''
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