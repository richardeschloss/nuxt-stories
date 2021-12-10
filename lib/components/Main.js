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
          story: this.activeStory
        }
      }),
      h('NuxtStoriesToc', {
        attrs: {
          story: this.activeStory
        }
      })
    ])
  },
  computed: {
    activeStory() {
      return this.$store.state && this.$store.state.$nuxtStories
        ? this.$store.state.$nuxtStories.activeStory
        : null
    }
  }
}