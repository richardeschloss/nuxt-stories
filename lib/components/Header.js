export default {
  render (h) {
    return h('header', {
      staticClass: 'navbar navbar-expand-md navbar-dark bg-dark bd-navbar'
    }, [
      h('nav', {
        staticClass: 'container-xxl flex-wrap flex-md-nowrap'
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
      ])
    ])
  }
}
