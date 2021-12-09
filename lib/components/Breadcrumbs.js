export default {
  render(h) {
    const { storiesAnchor } = this.$config.nuxtStories
    const { path, params } = this.$route
    const parts = path.split('/').slice(3)
    const breadcrumbs = parts
      .map((crumb, idx) => 
        h('li', {
          staticClass: 'breadcrumb-item',
          class: {
            active: idx === parts.length - 1
          }
        }, [
          idx === parts.length - 1 
            ? crumb
            : h('a', { 
              attrs: { 
                href: '#'
              }, 
              on: {
                click: (evt) => {
                  evt.preventDefault()
                  this.$router.push(`/${storiesAnchor}/${params.lang}/` + parts.slice(0, idx + 1).join('/') )
                }
              } 
            }, crumb)
        ])
      )
    return h('nav', {
      staticClass: 'bd-breadcrumbs'
    }, [
      h('ul', {
        staticClass: 'breadcrumb'
      }, breadcrumbs)
    ])
  }
}