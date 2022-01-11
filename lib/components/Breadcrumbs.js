import { h } from 'vue'
export default {
  props: ['story'],
  render () {
    const { storiesAnchor } = this.$config.nuxtStories
    const { params } = this.$route
    const { labels } = this.story
    const breadcrumbs = labels
      .map((crumb, idx) =>
        h('li', {
          class: 'breadcrumb-item' +
            (idx === labels.length - 1 ? ' active' : '')
        }, [
          idx === labels.length - 1
            ? decodeURIComponent(crumb)
            : h('a', {
              href: '#',
              onClick: (evt) => {
                evt.preventDefault()
                this.$router.push(`/${storiesAnchor}/${params.lang}/` + labels.slice(0, idx + 1).join('/'))
              }
            }, decodeURIComponent(crumb))
        ])
      )
    return h('nav', {
      class: 'bd-breadcrumbs'
    }, [
      h('ul', {
        class: 'breadcrumb'
      }, breadcrumbs)
    ])
  }
}
