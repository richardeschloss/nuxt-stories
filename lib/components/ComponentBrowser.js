import { h } from 'vue'
import Draggable from './Draggable'

export default {
  data () {
    return {
      filter: '',
      state: this.$nuxtStories(),
      modalWidth: '15%',
      modalHeight: '20%'
    }
  },
  render () {
    const componentList = Object.keys(this.$.appContext.components)
      .sort()
      .filter(key =>
        !key.startsWith('Lazy') &&
        !key.startsWith('NuxtStories') &&
        // this.$.appContext.components[key].name === 'AsyncComponentWrapper' &&
        key.match(this.filter)
      )
      .map((key) => {
        return h(Draggable, {
          transformElm: false,
          onDragend: (evt) => {
            this.state.addComponent = `<${key} />`
          }
        }, () => [h('li', {
          class: 'py-1 text-center',
          style: {
            'list-style': 'none',
            'border-bottom': '1px dotted rgba(150, 150, 150, 0.3)',
            'border-collapse': 'collapse'
          }
        }, key)])
      })

    const children = componentList
    if (children.length === 0) {
      const externalElms = this.externalLinks
        .map(({ link, label }) => {
          return h('li', {
            class: 'py-1 text-center',
            style: {
              'list-style': 'none'
            }
          }, h('button', {
            class: 'btn btn-primary',
            onClick: () => {
              window.open(link, '_blank')
            }
          }, label))
        })
      children.push(...externalElms)
    }

    const modal = h('div', {
      class: 'modal show',
      style: {
        background: 'white',
        width: this.modalWidth,
        height: this.modalHeight,
        'box-shadow': '-5px -5px rgba(150, 150, 150, 0.3)',
        transition: 'width 0.3s ease, height 0.3s ease'
      },
      onMouseenter: () => {
        this.modalWidth = '25%'
        this.modalHeight = '50%'
      },
      onMouseleave: () => {
        this.modalWidth = '15%'
        this.modalHeight = '20%'
      }
    }, [
      h('input', {
        class: 'form-control text-center',
        placeholder: 'Browse Components',
        value: this.filter,
        onInput: (evt) => {
          this.filter = evt.target.value
        }
      }),
      h('ul', {
        class: 'modal-body'
      }, children)
    ])
    return modal
  },
  computed: {
    externalLinks () {
      return [{
        label: 'Check NPM ↗️',
        link: `https://www.npmjs.com/search?q=keywords%3Avue%20${this.filter}&ranking=popularity`
      }, {
        label: 'Check Bit.dev ↗️',
        link: `https://bit.dev/components?labels=vue&q=${this.filter}`
      }, {
        label: 'Check Awesome Nuxt ↗️',
        link: 'https://github.com/nuxt-community/awesome-nuxt'
      }, {
        label: 'Check Awesome Vue ↗️',
        link: `https://github.com/vuejs/awesome-vue#${this.filter}`
      }]
    }
  },
  mounted () {
    Object.assign(this.$el.style, {
      display: 'block',
      right: 0,
      left: 'unset',
      bottom: 0,
      top: 'unset'
    })
  },
  methods: {
  }
}
