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
      h('NuxtStoriesLangSelect'),
      h('button', {
        staticClass: 'navbar-toggler collapsed',
        attrs: {
          'data-bs-toggle': "collapse",
          'data-bs-target': "#navbar-overflow"
        }
      }, [
        h('i', { staticClass: 'bi-list'})
      ]),
      overflowElm
    ])
  }
}
