export default {
  render (h) {
    const { storiesAnchor, lang } = this.$config.nuxtStories
    const brandLink = h('a', {
      staticClass: 'navbar-brand p-0 me-2',
      attrs: {
        href: `/${storiesAnchor}/${lang}/`
      }
    }, [
      h('NuxtStoriesLogo'),
      'Nuxt Stories'
    ])
    return h('nav', {
      staticClass: 'navbar navbar-expand-md navbar-dark bg-dark bd-navbar'  
    }, [
      h('div', {
        staticClass: 'container-fluid'
      }, [
        brandLink,
        h('NuxtStoriesModeSelect'),
        h('NuxtStoriesSearch', {
          staticClass: 'mt-2 mt-md-0'
        }),
        h('button', {
          staticClass: 'navbar-toggler mt-2',
          on: {
            click: () => {
              this.showOverflow = !this.showOverflow
            }
          }
        }, [
          h('i', { staticClass: 'bi-list'})
        ]),
        h('NuxtStoriesCollapse', {
          staticClass: 'navbar-collapse',
          attrs: {
            show: this.showOverflow
          }
        }, [
          h('NuxtStoriesHeaderOverflow')
        ])
      ])
    ])
  },
  data() {
    return {
      showOverflow: false
    }
  },
  mounted() {
    this.updateOverflow()
    window.addEventListener('resize', this.updateOverflow)
  },
  destroyed() {
    window.removeEventListener('resize', this.updateOverflow)
  },
  methods: {
    updateOverflow() {
      this.showOverflow = window.innerWidth > 768    
    }
  }
}
