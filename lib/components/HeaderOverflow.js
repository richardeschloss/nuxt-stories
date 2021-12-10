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
          h('NuxtStoriesLangSelect', {
            style: {
              width: '10%'
            }
          })
        ]),
        h('li', {
          staticClass: 'nav-item'
        }, [
          h('NuxtStoriesGithub', {
            style: {
              width: '10%'
            },
            attrs: {
              github: 'richardeschloss/nuxt-stories'
            }
          })
        ])
      ])
    ])
  }
}