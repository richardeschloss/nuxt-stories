export default {
  render(h) {
    return h('input', {
      staticClass: 'me-sm-2 form-control-dark w-75 form-control',
      attrs: {
        placeholder: 'Search...'
      }
    })
  }
}