import Debug from 'debug'
import VueRuntime from 'vue'
import Vue from 'vue/dist/vue.common.js'
import VueJsonPretty from 'vue-json-pretty'
import Markdown from '../utils/markdown.js'
import StoryFactory from '../utils/storyFactory.js'

VueRuntime.component('json', VueJsonPretty)

const debug = Debug('nuxt-stories')

Object.assign(Vue.config, {
  /* TBD: error handling (issue/69) */
  // For example, can by thrown by: {{ $route }},
  // which can be likely, if someone intends to type "{{ $route.path }}"
  errorHandler (err, vm, info) {
    debug('Vue error', err.message, vm, info)
    if (info === 'render') {
      // We re-throw the error again so that the page still stays alive,
      // but the user sees the error message in the dev console.
      // Otherwise, the page would just keep on crashing without a graceful means to exit.
      throw new Error(err)
    }
  },
  warnHandler (err, vm, info) {
    // Mute VueJsonPretty warnings (especially for json with functions)
    if (info.includes('VueJsonPretty')) { 
      return 
    } else if (err.includes('Error compiling template')) {
      // Yeah, we know, we're compiling on the fly...
      debug(err, vm, info)
      throw new Error(err)
    }
    console.warn(err, vm, info)
  }  
})

export default {
  props: ['story'],
  render(h) {
    const compilationError = h('span', {
      style: {
        color: 'red'
      }
    }, this.compilationError)
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
    }, [ h(this.compiledVue), this.compilationError ? compilationError : null ])
  },
  data() {
    return {
      compilationError: null,
      compiledMarkdown: '',
      compiledVue: null,
      hdrs: [],
      scrollTimer: null,
      navigating: false
    }
  },
  watch: {
    'story.content'(n) {
      const { compiled } = Markdown.parse(n)
      this.compiledMarkdown = compiled
      this.compileVue()
    },
    'story.href'() {
      const { compiled } = Markdown.parse(this.story.content)
      this.compiledMarkdown = compiled
      this.compileVue()
      this.$nextTick(() => {
        this.observer.disconnect()
        this.observeHdrs()
      })
    },
    '$route.hash'() {
      this.scrollToHash()
    }
  },
  mounted() {
    this.compiledMarkdown = this.story.compiled
    this.compileVue()
    this.$nextTick(() => {
      // Wait for compiled content to be rendered before observing...
      this.observeHdrs()
      this.scrollToHash()
      this.$el.addEventListener('scroll', this.observeScrolling)
    })
  },
  beforeDestroy() {
    this.observer.disconnect()
    this.$el.removeEventListener('scroll', this.observeScrolling)
  },
  methods: {
    compileVue() {
      try {
        const { frontMatter } = this.story
        this.compilationError = null
        const res = Vue.compile(`<div>${this.compiledMarkdown}</div>`)
        this.compiledVue = StoryFactory({ cfg: this.$config.nuxtStories, frontMatter, ...res })
      } catch (err) {
        // Squash Compilation error since we compile on the fly
        // Enable debugging to view the error messages if desired.
        this.compilationError = err.message
      }
    },
    observeScrolling() {
      this.$parent.$emit('viewerScrolling', true)
      if (this.timer !== null) {
        clearTimeout(this.timer);        
      }
      this.timer = setTimeout(() => {
        this.$parent.$emit('viewerScrolling', false)
        this.navigating = false        
      }, 150);
    },
    observeHdrs() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
      }
  
      this.hdrs = this.story.toc.map(({href}) => href)
      this.observer = new IntersectionObserver((entries) => {
        if (this.navigating) {
          return
        }
        const entry = entries[0]
        let activeHdr = '#' + entry.target.id
        if (!entry.isIntersecting 
          && entry.boundingClientRect.y - entry.intersectionRect.y >= 0
          && entry.intersectionRatio > 0) {
          const idx = this.hdrs.findIndex((hdr) => hdr === '#' + entry.target.id)
          activeHdr = this.hdrs[idx - 1]  
        }
        this.$emit('activeHdr', activeHdr)
      }, options);
  
      this.hdrs.forEach((hdr) => {
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
    scrollToHash() {
      const { hash } = this.$route
      if (hash !== '') {
        this.scrollIntoView({ href: hash })
      }
    },
    scrollIntoView({ href }) {
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