export default {
  render(h) {
    return h('div', {
      staticClass: 'container-xxl my-md-4 bd-layout'
    }, [
      h('NuxtStoriesSideNav'),
      h('NuxtStoriesMain')
    ])
  }
}