import { delay } from 'les-utils/utils/promise.js'
import DB from '../db.client.js'

const db = DB({})

export default {
  render(h) {
    const inputElm = h('input', {
      staticClass: 'form-control-dark form-control',
      style: {
        'background-clip': this.hits.length > 0
          ? 'unset'
          : 'padding-box'
      },
      attrs: {
        id: 'nuxt-stories-search',
        placeholder: 'Search...(Ctrl + / to focus)'
      },
      domProps: {
        value: this.q
      },
      on: {
        input: (evt) => {
          this.q = evt.target.value
          this.search()
        }
      }
    })
    const children = [inputElm]
    if (this.hits.length > 0) {
      const results = this.hits.map(({ href, labels, preview }) => {
        const labelElms = [h('span', { staticClass: 'fw-bold' }, labels[0])]
        if (labels.length > 0) {
          labels.slice(1).forEach((label) => {
            labelElms.push(
              h('i', { staticClass: 'bi-chevron-right px-1' }),
              label
            )
          })
        }
        const previewElms = preview !== undefined 
          ? h('p', {}, [
            preview[0],
            h('span', { 
              staticClass: 'fw-bold px-2', 
              style: {
                'background-color': '#cbd720'
              } 
            }, preview[1]),
            ' ' + preview[1]
          ])
          : h()

        return h('li', {},[
          h('a', { 
            attrs: { href }, 
            staticClass: 'd-flex nuxt-link pt-2 lh-lg search-result-link' 
          }, labelElms),
          previewElms
        ])
      })

      const resultsElm = h('ul', {
        staticClass: 'position-absolute bg-white w-100 search-results-box'      
      }, results)
      children.push(resultsElm)
    }
    return h('div', {
      staticClass: 'me-sm-2 w-75 position-relative'
    }, children)
  },
  data() {
    return {
      hits: [],
      q: '',
      debounceMs: 300
    }
  },
  async mounted () {
    // static host..
    await db.load()
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
    },
    async search() {
      this.hits = []
      await delay(this.debounceMs)
      this.hits = await db.search(this.q)
    }
  }
}