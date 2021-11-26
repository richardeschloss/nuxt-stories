export default {
  render(h) {
    return h('div', {
      attrs: {
        id: 'navbar-overflow'
      },
      staticClass: 'navbar-collapse collapse'
    }, [
      h('ul', {
        staticClass: 'navbar-nav ml-auto'
      }, [
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