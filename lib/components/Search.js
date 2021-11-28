import DB from '../db.client.js'

export default {
  render(h) {
    // TBD: fix styling... search results should be flush with search box
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
      h('li', {},[
        h('a', { attrs: { href: '/' }, staticClass: 'd-flex nuxt-link pt-2 lh-lg search-result-link' }, [
          h('span', { staticClass: 'fw-bold' }, 'Components')
        ])
      ]),
      h('li', {},[
        h('a', { staticClass: 'nuxt-link pt-2 lh-lg' }, 'Components > Component1')
      ]),
      h('li', {},[
        h('a', { staticClass: 'nuxt-link pt-2 lh-lg' }, 'Components > Component2')
      ])
    ])
    return h('div', {
      staticClass: 'me-sm-2 w-75 position-relative'
    }, [
      inputElm,
      resultsElm
    ])
  },
  async mounted () {
    // static host..
    const db = DB({})
    await db.load()
    const hits = await db.search('Example')
    console.log('hits', hits)
    //
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