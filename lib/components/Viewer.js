
export default {
  props: ['story', 'viewerScrollTo'],
  render(h) {
    return h('div', {
      attrs: {
        id: 'viewer'
      },
      style: {
        height: '75vh',
        'overflow-y': 'scroll',
        padding: '20px',
        color: '#333'
      }
    })
  },
  data() {
    return {
      compiledMarkdown: '',
      compiledVue: ''
    }
  },
  watch: {
    // TBD: watch active header on scroll....
    // Then emit active header
    viewerScrollTo(n) {
      this.scrollIntoView(n)
    },
    'story.href'(n) {
      this.compiledMarkdown = this.story.compiled
      this.$el.innerHTML = this.compiledMarkdown  
    }
  },
  mounted() {
    this.compiledMarkdown = this.story.compiled
    this.$el.innerHTML = this.compiledMarkdown
  },
  methods: {
    scrollIntoView(href) {
      const headerElm = this.$el.querySelector(href)
      const viewerElm = this.$el
      const { y: y1 } = headerElm.getBoundingClientRect()
      const { y: y2 } = viewerElm.getBoundingClientRect()
      viewerElm.scrollTo({
        top: y1 - y2 + viewerElm.scrollTop, 
        behavior: 'smooth'
      })
    }
  }
}