export default {
  render(h) {
    return h('main', {
      staticClass: 'bd-main order-1'
    }, [
      h('NuxtStoriesBreadcrumbs'),
      h('NuxtStoriesContent'),
      h('NuxtStoriesToc')
    ])
  }
}