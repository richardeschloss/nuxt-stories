import { delay } from 'les-utils/utils/promise.js'

export default {
  render (h) {
    const inputElm = h('input', {
      staticClass: 'form-control-dark form-control',
      style: {
        'background-clip': this.hits.length > 0
          ? 'unset'
          : 'padding-box'
      },
      attrs: {
        id: 'nuxt-stories-search',
        placeholder: 'Search...(Ctrl + / to focus, again to clear)',
        autocomplete: 'off'
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
          ? h('p', {
            on: {
              click: () => {
                this.toStory(href)
              }
            },
            staticClass: 'my-0 nuxt-story-preview',
            style: {
              cursor: 'pointer',
              'font-size': '12px'
            }
          }, [
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

        return h('li', {}, [
          h('a', {
            on: {
              click: () => {
                this.toStory(href)
              }
            },
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
      staticClass: 'w-100'
    }, children)
  },
  data () {
    return {
      hits: [],
      q: '',
      debounceMs: 300
    }
  },
  mounted () {
    const { staticHost } = this.$config.nuxtStories
    if (!staticHost) {
      this.socket = this.$nuxtSocket({
        channel: '/',
        persist: 'storiesSocket',
        namespaceCfg: {
          emitters: ['searchStories']
        }
      })
    }
    window.addEventListener('keydown', this.keydown)
  },
  beforeDestroy () {
    window.removeEventListener('keydown', this.keydown)
  },
  methods: {
    toStory (href) {
      this.$router.push(href)
      this.q = ''
      this.hits = []
    },
    keydown (evt) {
      if (evt.ctrlKey && evt.key === '/') {
        this.$el.children[0].focus()
        if (this.q !== '') {
          this.q = ''
          this.hits = []
        }
      }
    },
    async search () {
      const { staticHost, db } = this.$config.nuxtStories
      this.hits = []
      await delay(this.debounceMs)
      const searchFn = staticHost
        ? db.search
        : this.searchStories
      this.hits = await searchFn(this.q)
    }
  }
}
