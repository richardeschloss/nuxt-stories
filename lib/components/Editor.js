export default {
  props: ['story'],
  render(h) {
    return h('textarea', {
      style: {
        border: 'none',
        'border-right': '1px solid #ccc',
        resize: 'none',
        outline: 'none',
        'background-color': '#f6f6f6',
        'font-size': '14px',
        'font-family': "'Monaco', courier, monospace",
        padding: '20px'
      },
      on: {
        input: () => {
          this.updateCompiled()
        }
      }
    }, this.input)
  },
  data() {
    return {
      input: ''
    }
  },
  watch: {
    'story.href'(n) {
      this.input = this.story.content
    }
  },
  mounted() {
    this.input = this.story.content
    this.socket = this.$nuxtSocket({
      persist: 'storiesSocket',
      channel: ''
    })
  },
  methods: {
    updateCompiled() {

    }
  }
}