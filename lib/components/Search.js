import { h } from 'vue'
import { delay } from 'les-utils/utils/promise.js'
import Svg from './Svg.js'

export default {
  render () {
    const inputElm = h('input', {
      class: 'form-control-dark form-control',
      style: {
        'background-clip': this.hits.length > 0
          ? 'unset'
          : 'padding-box'
      },
      id: 'nuxt-stories-search',
      placeholder: 'Search...(Ctrl + / to focus, again to clear)',
      autocomplete: 'off',
      value: this.q,
      onInput: (evt) => {
        this.q = evt.target.value
        this.search()
      }
    })
    const children = [inputElm]
    if (this.hits.length > 0) {
      const results = this.hits.map(({ href, labels, preview }) => {
        const labelElms = [h('span', { class: 'fw-bold' }, labels[0])]
        if (labels.length > 0) {
          labels.slice(1).forEach((label) => {
            labelElms.push(
              h('i', { class: 'px-1' }, [
                h(Svg, {
                  icon: 'chevron-right'
                })
              ]),
              label
            )
          })
        }
        const previewElms = preview !== undefined
          ? h('p', {
            onclick: () => {
              this.toStory(href)
            },
            class: 'my-0 nuxt-story-preview',
            style: {
              cursor: 'pointer',
              'font-size': '12px'
            }
          }, [
            preview[0],
            h('span', {
              class: 'fw-bold px-2',
              style: {
                'background-color': '#cbd720'
              }
            }, preview[1]),
            ' ' + preview[1]
          ])
          : null

        return h('li', {}, [
          h('a', {
            onclick: () => {
              this.toStory(href)
            },
            class: 'd-flex nuxt-link pt-2 lh-lg search-result-link'
          }, labelElms),
          previewElms
        ])
      })

      const resultsElm = h('ul', {
        class: 'position-absolute search-results-box'
      }, results)
      children.push(resultsElm)
    }
    return h('div', {
      class: 'w-100',
      style: {
        position: 'relative'
      }
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
    const { staticHost } = this.$config.public.nuxtStories
    if (!staticHost) {
      this.socket = this.$nuxtSocket({
        name: 'nuxtStories',
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
      const { staticHost, db } = this.$config.public.nuxtStories
      this.hits = []
      await delay(this.debounceMs)
      const searchFn = staticHost
        ? db.search
        : this.searchStories
      this.hits = await searchFn(this.q)
    }
  }
}
