export default {
  render(h) {
    return h('main', {
      staticClass: 'bd-main order-1'
    }, [
      'MAIN Content! ==> ' + this.$route.path
    ])
  }
}