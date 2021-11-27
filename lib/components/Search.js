export default {
  render(h) {
    const inputElm = h('input', {
      staticClass: 'form-control-dark form-control',
      attrs: {
        id: 'nuxt-stories-search',
        placeholder: 'Search...(Ctrl + / to focus)'
      }
    })
    const resultsElm = h('ul', {
      staticClass: 'position-absolute bg-white w-100 search-results-box'      
    }, [
      h('li', 'RESULT 1 here!!')
    ])
    return h('div', {
      staticClass: 'me-sm-2 w-75 position-relative'
    }, [
      inputElm,
      resultsElm
    ])
  },
  mounted () {
    window.addEventListener('keydown', this.keydown)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.keydown)
  },
  methods: {
    keydown(evt) {
      if (evt.ctrlKey && evt.key === '/') {
        this.$el.children[0].focus()
      }
    }
  }
}