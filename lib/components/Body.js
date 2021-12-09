export default {
  render(h) {
    return h('div', {
      staticClass: 'container-xxl my-md-2 bd-layout'
    }, [
      h('NuxtStoriesSideNav'),
      h('NuxtStoriesMain')
    ])
  }
}