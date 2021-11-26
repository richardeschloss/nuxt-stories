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
          h('a', {
            attrs: {
              href: `https://github.com/${this.github}`,
              target: '_blank'
            },
            staticClass: 'nav-link'
          }, [
            h('img', {
              attrs: {
                src: '/nuxtStories/svg/GithubLogo.svg'
              }
            })
          ])
        ])
      ])
    ])
  },
  data() {
    return {
      github: 'richardeschloss/nuxt-stories'
    }
  }
}