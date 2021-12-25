export default {
  props: ['story'],
  render (h) {
    const { inputDebounceMs = 350 } = this.$config.nuxtStories
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
        id: 'editor'
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
        mouseenter: () => {
          // Make it a textarea so we can edit
          this.tag = 'textarea'
          this.preserveScrollTop()
        },
        mouseleave: () => {
          // Turn it back to a div so scrolling will work
          this.tag = 'div'
          this.preserveScrollTop()
        },
        input: (evt) => {
          if (this.typing !== null) {
            clearTimeout(this.typing)
          }
          this.typing = setTimeout(null, inputDebounceMs)

          this.input = evt.target.value
          this.updateCompiled(evt.target.value)
        }
      }
    }, children)
  },
  data () {
    return {
      input: '',
      cursorIdx: 0,
      typing: false,
      updatingTitle: null,
      tag: 'div'
    }
  },
  computed: {
    viewMode () {
      return this.$store.state.$nuxtStories.viewMode
    }
  },
  watch: {
    'story.frontMatter.title' (n) {
      if (!this.typing || n === '' || n === undefined) { return }
      const { titleDebounceMs = 700 } = this.$config.nuxtStories
      const oldHref = this.story.href
      const parts = oldHref.split('/')
      const newHref = [...parts.slice(0, parts.length - 1), n].join('/')
      if (this.updatingTitle !== null) {
        clearTimeout(this.updatingTitle)
      }
      this.updatingTitle = setTimeout(() => {
        this.updatingTitle = false
        this.renameStory({ oldHref, newHref })
        this.$router.push(newHref)
      }, titleDebounceMs)
    },
    'story.content' (n) {
      if (!this.typing) {
        // Change came from user on the FS
        this.input = n
      }
    },
    'story.href' () {
      this.cursorIdx = 0
      this.input = this.story.content
    },
    '$route.hash' (n) {
      this.input = this.story.content
      this.scrollToHash()
    },
    viewMode () {
      this.cursorIdx = 0
      this.scrollToHash()
    }
  },
  mounted () {
    this.input = this.story.content
    this.socket = this.$nuxtSocket({
      persist: 'storiesSocket',
      channel: '',
      namespaceCfg: {
        emitters: ['updateContent', 'renameStory']
      }
    })
    this.cursorElm = this.$el.children[0]
    this.scrollToHash()
  },
  methods: {
    preserveScrollTop () {
      const oldTop = this.$el.scrollTop
      this.$nextTick(() => {
        this.$el.scrollTo({ top: oldTop })
      })
    },
    updateCompiled (content) {
      const { staticHost } = this.$config.nuxtStories
      this.$store.commit(
        '$nuxtStories/SET_ACTIVE_STORY',
        {
          ...this.story,
          content
        }
      )
      if (!staticHost) {
        this.updateContent({ href: this.story.href, content })
      }
    },
    scrollToHash () {
      if (this.$route.hash !== '') {
        const hdr = this.story.toc.find(({ href }) => href === this.$route.hash)
        if (hdr) {
          this.scrollToHref(hdr)
        }
      }
    },
    async scrollToHref ({ depth, text }) {
      const regex = new RegExp(`#{${depth}}\\s*${text.toLowerCase()}`)
      const fnd = this.input.toLowerCase().match(regex)
      if (fnd) {
        this.cursorIdx = fnd.index
        // Let the DOM update before computing cursor position
        this.$nextTick(() => {
          const { y: y1 } = this.$el.getBoundingClientRect()
          const { y: y2 } = this.$el.querySelector('#editor-cursor').getBoundingClientRect()
          const top = y2 - y1 + this.$el.scrollTop
          this.$el.scrollTo({
            top,
            behavior: 'smooth'
          })
          this.cursorIdx = 0
        })
      }
    }
  }
}
