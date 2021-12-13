export default {
  props: ['story'],
  render(h) {
    const children = [
      this.input.slice(0, this.cursorIdx),
      // Use a dummy element that gives us a bounding box for "free" :)
      // The textContent of the editor should not include this since this element is empty
      h('i', {
        attrs: {
          id: 'editor-cursor'
        }
      }),
      this.input.slice(this.cursorIdx)
    ]
    return h(this.tag, {
      attrs: {
        id: 'editor',
        contenteditable: true
      },
      style: {
        height: '75vh',
        'overflow-y': 'scroll',
        border: 'none',
        'border-right': '1px solid #ccc',
        resize: 'none',
        outline: 'none',
        'background-color': '#f6f6f6',
        'font-size': '14px',
        'font-family': "'Monaco', courier, monospace",
        padding: '20px',
        'white-space': 'pre-wrap'
      },
      on: {
        input: (evt) => {
          this.updateCompiled(evt.target.textContent)
        }
      }
    }, children) // this.input)
  },
  data() {
    return {
      tag: 'div', //'textarea', // TBD: verify content saves ok...
      input: '',
      cursorIdx: 0
    }
  },
  computed: {
    viewMode() {
      return this.$store.state.$nuxtStories.viewMode
    }
  },
  watch: {
    'story.href'() {
      this.input = this.story.content
    },
    '$route.hash'() {
      this.scrollToHash()
    },
    viewMode() {
      this.cursorIdx = 0
      this.scrollToHash()
    }
  },
  mounted() {
    this.input = this.story.content
    this.socket = this.$nuxtSocket({
      persist: 'storiesSocket',
      channel: ''
    })
    this.cursorElm = this.$el.children[0]
    this.scrollToHash()
  },
  methods: {
    updateCompiled(content) {
      // console.log('new content', content)
    },
    scrollToHash() {
      if (this.$route.hash !== '') {
        const hdr = this.story.toc.find(({ href }) => href === this.$route.hash)
        if (hdr) {
          this.scrollToHref(hdr)
        }
      }
    },
    async scrollToHref({ depth, text }) {
      const regex = new RegExp(`#{${depth}}\\s*${text.toLowerCase()}`)
      const fnd = this.input.toLowerCase().match(regex)
      if (fnd) {
        this.cursorIdx = fnd.index
        // Let the DOM update before computing cursor position
        this.$nextTick(() => {
          const { y: y1 } = this.$el.getBoundingClientRect()
          const { y: y2 } = this.cursorElm.getBoundingClientRect()
          this.$el.scrollTo({
            top: y2 - y1 + this.$el.scrollTop, 
            behavior: 'smooth'
          })
          this.cursorIdx = 0
        })
      }
    }
  }
}
