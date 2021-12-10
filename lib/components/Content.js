export default {
  render(h) {
    const children = []
    if (this.viewMode === 'edit') {
      children.push(h('NuxtStoriesEditor'))
    } else if (this.viewMode === 'view') {
      children.push(h('NuxtStoriesViewer'))
    } else {
      children.push(h('NuxtStoriesEditor'), h('NuxtStoriesViewer'))
    }
    return h('div', {
      staticClass: 'bd-content'
    }, children)
  },
  computed: {
    viewMode() {
      if (this.$store.state && this.$store.state.$nuxtStories) {
        return this.$store.state.$nuxtStories.viewMode
      } else {
        let viewMode = 'view'
        if (process.client && localStorage.getItem('nuxtStoriesViewMode')) {
          viewMode = localStorage.getItem('nuxtStoriesViewMode')
        }
        return viewMode
      }
    }
  }
}