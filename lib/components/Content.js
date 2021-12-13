export default {
  props: ['story', 'scrollTo'],
  data() {
    return {
      viewerScrollTop: 0
    }
  },
  render(h) {
    const children = []
    const editor = h('NuxtStoriesEditor', {
      attrs: { 
        story: this.story,
        scrollTo: this.scrollTo,
        viewerScrollTop: this.viewerScrollTop
      }
    })
    const viewer = h('NuxtStoriesViewer', {
      attrs: { 
        story: this.story,
        scrollTo: this.scrollTo
      },
      on: {
        viewerScrollTop: (info) => {
          this.viewerScrollTop = info
        },
        activeHdr: (info) => {
          this.$emit('activeHdr', info)
        },
        scrollToId: (info) => {
          console.log('emit...', info)
          this.$emit('scrollToId', info)
        }
      }
    })
    let gridTemplateColumns = '1fr'
    if (this.viewMode === 'edit') {
      children.push(editor)
    } else if (this.viewMode === 'view') {
      children.push(viewer)
    } else {
      gridTemplateColumns += ' 1fr'
      children.push(editor, viewer)
    }
    return h('div', {
      staticClass: 'bd-content',
      style: {
        'display': 'grid',
        'grid-template-columns': gridTemplateColumns
      }
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