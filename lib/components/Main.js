export default {
  render(h) {
    return h('main', {
      staticClass: 'bd-main order-1'
    }, [
      'Breadcrumbs..',
      h('header', {
        staticClass: 'bd-content'
      }),
      h('section', {
        staticClass: 'bd-content'
      }, [
        'MAIN Content! ==> ' + this.$route.path,
        // h('NuxtChild')
      ])
      // 'MAIN Content! ==> ' + this.$route.path,
      // h('NuxtChild')
    ])
  }
}