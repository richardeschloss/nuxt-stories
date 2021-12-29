export default {
  props: ['story'],
  render (h) {
    const { storiesAnchor } = this.$config.nuxtStories
    const { params } = this.$route
    const { labels } = this.story
    const breadcrumbs = labels
      .map((crumb, idx) =>
        h('li', {
          staticClass: 'breadcrumb-item',
          class: {
            active: idx === labels.length - 1
          }
        }, [
          idx === labels.length - 1
            ? decodeURIComponent(crumb)
            : h('a', {
              attrs: {
                href: '#'
              },
              on: {
                click: (evt) => {
                  evt.preventDefault()
                  this.$router.push(`/${storiesAnchor}/${params.lang}/` + labels.slice(0, idx + 1).join('/'))
                }
              }
            }, decodeURIComponent(crumb))
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
