export default {
  render (h) {
    const overflowElm = h('NuxtStoriesHeaderOverflow')
    return h('header', {
      staticClass: 'navbar navbar-expand-md navbar-dark bg-dark bd-navbar'
    }, [
      h('nav', {
        staticClass: 'flex-wrap flex-md-nowrap'
      }, [
        h('a', {
          staticClass: 'navbar-brand p-0 me-2',
          attrs: {
            href: '/stories'
          }
        }, [
          h('NuxtStoriesLogo'),
          'Nuxt Stories'
        ])
      ]),
      h('NuxtStoriesModeSelect'),
      h('NuxtStoriesSearch'),
      h('button', {
        staticClass: 'navbar-toggler collapsed',
        on: {
          click: () => this.collapse.toggle()
        }
      }, [
        h('i', { staticClass: 'bi-list'})
      ]),
      overflowElm
    ])
  },
  data () {
    return {
      collapse: null
    }
  },
  async mounted() {
    const { Collapse } = await import('bootstrap/dist/js/bootstrap.esm.js')
    this.collapse = new Collapse(document.getElementById('navbar-overflow'), {
      toggle: false
    })
  }
}
