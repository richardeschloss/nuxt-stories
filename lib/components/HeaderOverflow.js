export default {
  render(h) {
    return h('div', {
    }, [
      h('ul', {
        staticClass: 'navbar-nav' // ml-auto'
      }, [
        h('li', {
          staticClass: 'nav-item mx-md-2'
        }, [
          h('NuxtStoriesLangSelect')
        ]),
        h('li', {
          staticClass: 'nav-item'
        }, [
          h('NuxtStoriesGithub', {
            attrs: {
              github: 'richardeschloss/nuxt-stories'
            }
          })
        ])
      ])
    ])
  }
}