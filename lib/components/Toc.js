export default {
  props: ['story'],
  render(h) {
    return h('div', {
      staticClass: 'bd-toc'
    }, [
      'Toc here'
    ])
  }
}