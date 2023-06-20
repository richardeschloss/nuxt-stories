import { h, nextTick } from 'vue'
import { delay } from 'les-utils/utils/promise.js'
import Debug from 'debug'
import Markdown from '../utils/markdown.js'
import StoryFactory, { LoadDeps } from '../utils/storyFactory.js'

const debug = Debug('nuxt-stories')

let compileVue
async function importCompiler () {
  if (process.env.NODE_ENV === 'production') {
    compileVue = (await import('../utils/vue.esm-bundler.js')).compile
  } else {
    compileVue = (await import('vue/dist/vue.esm-bundler.js')).compile
  }
}

export default {
  props: ['story'],
  render () {
    const children = []
    const compilationError = h('span', {
      style: {
        color: 'red'
      }
    }, this.compilationError)

    if (this.compiledVue) {
      children.push(
        h(this.compiledVue)
      )
    }

    if (this.compilationError) {
      children.push(compilationError)
    }
    return h('div', {
      id: 'viewer',
      style: {
        height: '75vh',
        'overflow-y': 'scroll',
        padding: '20px',
        color: '#333'
      },
      onScroll: this.observeScrolling,
      onDblclick: this.setStyleSelector,
      onMouseover: this.showStylingHint
    }, children)
  },
  computed: {
    compilationError () {
      return this.state.compilationError
    }
  },
  data () {
    return {
      compiledMarkdown: '',
      compiledVue: null,
      hdrs: [],
      scrollTimer: null,
      navigating: false,
      state: this.$nuxtStories()
    }
  },
  watch: {
    'story.content' (n) {
      const { compiled } = Markdown.parse(n)
      this.compiledMarkdown = compiled
      this.compileVue()
    },
    async 'story.href' () {
      const { compiled } = Markdown.parse(this.story.content)
      this.compiledMarkdown = compiled
      this.compileVue()
      await nextTick()
      this.observer.disconnect()
      this.observeHdrs()
    },
    '$route.hash' () {
      this.scrollToHash()
    }
  },
  async mounted () {
    await importCompiler()
    this.compiledMarkdown = this.story.compiled
    this.compileVue()
    await nextTick()
    await delay(100)

    // Wait for compiled content to be rendered before observing...
    this.observeHdrs()
    this.scrollToHash()
  },
  beforeUnmount () {
    if (this.observer) {
      this.observer.disconnect()
      this.$el.removeEventListener('scroll', this.observeScrolling)
    }
  },
  methods: {
    async compileVue () {
      try {
        const { frontMatter } = this.story
        this.$nuxtStories().value.compilationError = null
        const render = compileVue(`<div>${this.compiledMarkdown}</div>`)
        this.state.compiledVue = false
        const { imported, fetched } = await LoadDeps({ ctx: this, frontMatter })
        this.compiledVue = StoryFactory({
          frontMatter,
          imported,
          fetched,
          render
        })
        this.state.compiledVue = true
      } catch (err) {
        // Squash Compilation error since we compile on the fly
        // Enable debugging to view the error messages if desired.
        this.state.compilationError = err.message
      }
    },
    observeScrolling () {
      this.$parent.$emit('viewerScrolling', true)
      if (this.timer !== null) {
        clearTimeout(this.timer)
      }
      this.timer = setTimeout(() => {
        this.$parent.$emit('viewerScrolling', false)
        this.navigating = false
      }, 150)
    },
    observeHdrs () {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
      }

      this.hdrs = this.story.toc.map(({ href }) => href)
      this.observer = new IntersectionObserver((entries) => {
        if (this.navigating) {
          return
        }
        const entry = entries[0]
        let activeHdr = '#' + entry.target.id
        if (!entry.isIntersecting &&
          entry.boundingClientRect.y - entry.intersectionRect.y >= 0 &&
          entry.intersectionRatio > 0) {
          const idx = this.hdrs.findIndex(hdr => hdr === '#' + entry.target.id)
          activeHdr = this.hdrs[idx - 1]
        }
        this.$emit('activeHdr', activeHdr)
      }, options)

      Array.from(this.hdrs).forEach((hdr) => {
        let elm
        try {
          // More robust to getElementById than querySelector
          // querySelector will fail on #123 for an element with id === 123,
          // but getElementById won't fail
          elm = document.getElementById(hdr.slice(1))
        } catch (err) {
          debug('error getting element', hdr, err)
        }
        if (elm) {
          this.observer.observe(elm)
        }
      })
    },
    setStyleSelector (evt) {
      const elm = evt.target
      if (elm.id) {
        this.state.stylingSelector = '#' + elm.id
      } else if (elm.classList.value !== '') {
        this.state.stylingSelector = '.' + Array.from(elm.classList).join('.')
      } else {
        this.state.stylingSelector = null
      }
    },
    showStylingHint (evt) {
      const elm = evt.target
      if (elm.title === '') {
        elm.title = 'DblClick to edit style'
      }
    },
    scrollToHash () {
      const { hash } = this.$route
      if (hash !== '') {
        this.scrollIntoView({ href: hash })
      }
    },
    scrollIntoView ({ href }) {
      this.navigating = true
      let headerElm
      try {
        headerElm = this.$el.querySelector(href)
      } catch (err) {
        debug(err)
      }
      if (!headerElm) {
        this.navigating = false
        return
      }
      const viewerElm = this.$el
      const { y: y1 } = headerElm.getBoundingClientRect()
      const { y: y2 } = viewerElm.getBoundingClientRect()
      const top = y1 - y2 + viewerElm.scrollTop
      viewerElm.scrollTo({
        top,
        behavior: 'smooth'
      })
      this.$emit('viewerScrollTop', { top })
    }
  }
}
