export default {
  props: ['story'],
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
      compiledVue: '',
      hdrs: [],
      scrollTimer: null,
      navigating: false
    }
  },
  watch: {
    'story.href'() {
      this.compiledMarkdown = this.story.compiled
      this.$el.innerHTML = this.compiledMarkdown  

      this.observer.disconnect()
      this.observeHdrs()
    },
    '$route.hash'() {
      this.scrollToHash()
    }
  },
  mounted() {
    this.compiledMarkdown = this.story.compiled
    this.$el.innerHTML = this.compiledMarkdown
    this.observeHdrs()
    this.scrollToHash()
    this.$el.addEventListener('scroll', this.observeScrolling)
  },
  beforeDestroy() {
    this.observer.disconnect()
    this.$el.removeEventListener('scroll', this.observeScrolling)
  },
  methods: {
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
        if (document.querySelector(hdr)) {
          this.observer.observe(document.querySelector(hdr))
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
      const headerElm = this.$el.querySelector(href)
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