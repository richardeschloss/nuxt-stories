export default {
  props: ['story', 'scrollTo'],
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
      hdrs: []
    }
  },
  watch: {
    scrollTo(n) {
      this.scrollIntoView(n)
    },
    'story.href'(n) {
      this.compiledMarkdown = this.story.compiled
      this.$el.innerHTML = this.compiledMarkdown  

      this.observer.disconnect()
      this.observeHdrs()
    },
    '$route.hash'(n) {
      this.scrollToHash()
    }
  },
  mounted() {
    this.compiledMarkdown = this.story.compiled
    this.$el.innerHTML = this.compiledMarkdown
    this.observeHdrs()
    // this.scrollToHash() // TBD...
  },
  beforeDestroy() {
    this.observer.disconnect()
  },
  methods: {
    observeHdrs() {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
      }
  
      this.hdrs = this.story.toc.map(({href}) => href)
      this.observer = new IntersectionObserver((entries) => {
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
        } else {
          console.log(hdr, 'not an element')
        }
      })
    },
    scrollToHash() {
      const { hash } = this.$route
      if (hash !== '') {
        const headerElm = this.$el.querySelector(hash)
        if (headerElm) {
          const { tagName, textContent } = headerElm
          this.$emit('scrollToId', {
            href: hash,
            depth: tagName.split('H')[1],
            text: textContent
          })
        }
      }
    },
    scrollIntoView({ href }) {
      const headerElm = this.$el.querySelector(href)
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