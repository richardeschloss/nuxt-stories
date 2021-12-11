
export default {
  props: ['story'],
  render(h) {
    return h('div', {
      style: {
        height: '75vh',
        'overflow-y': 'scroll',
        padding: '20px',
        // 'font-family': "'Helvetica Neue', Arial, sans-serif",
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
    'story.href'(n) {
      this.compiledMarkdown = this.story.compiled
      this.$el.innerHTML = this.compiledMarkdown  
    }
  },
  mounted() {
    this.compiledMarkdown = this.story.compiled
    this.$el.innerHTML = this.compiledMarkdown
  }
}