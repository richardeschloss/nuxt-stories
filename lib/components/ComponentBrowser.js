import { h } from 'vue'

export default {
  data () {
    return {
      filter: '',
      state: this.$nuxtStories(),
      modalWidth: '15%',
      modalHeight: '10%',
      hovered: '50%'
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
        let timer
        const children = [
          h('span', {
            onDragstart: (evt) => {
              document.getElementById('editor').dispatchEvent(
                new DragEvent('dragstart', evt)
              )
            },
            onMouseout: () => {
              clearTimeout(timer)
              this.hovered = ''
            },
            onMouseover: (evt) => {
              const range = document.createRange()
              range.selectNode(evt.target)
              window.getSelection().removeAllRanges()
              window.getSelection().addRange(range)
              timer = setTimeout(() => {
                this.hovered = key
              }, 1000)
            }
          }, `<${key} />`)
        ]
        if (this.hovered === key) {
          children.push(h('div', {
            class: 'position-absolute',
            style: {
              'z-index': 1,
              background: 'white',
              'box-shadow': '0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%), 0px 2px 4px -1px rgb(0 0 0 / 20%)',
              // 'box-shadow': '-5px -5px aquamarine',
              top: ''
            }
          }, h(this.$.appContext.components[key])))
        }
        return h('li', {
          class: 'py-1 text-center position-relative',
          style: {
            cursor: 'pointer',
            'list-style': 'none',
            'border-bottom': '1px dotted rgba(150, 150, 150, 0.3)',
            'border-collapse': 'collapse'
          }
        }, children)
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
        'box-shadow': '0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%), 0px 5px 5px -3px rgb(0 0 0 / 20%)',
        // 'box-shadow': '-5px -5px rgba(150, 150, 150, 0.3)',
        transition: 'width 0.3s ease, height 0.3s ease'
      },
      onMouseenter: () => {
        this.modalWidth = 'fit-content'
        this.modalHeight = '50%'
      },
      onMouseleave: () => {
        this.modalWidth = '15%'
        this.modalHeight = '10%'
      }
    }, [
      h('div', {
        class: 'bg-dark'
        // style: {
        //   background: 'black'
        // }
      }, h('input', {
        class: 'form-control-dark form-control text-center',
        placeholder: 'Browse Components',
        value: this.filter,
        onInput: (evt) => {
          this.filter = evt.target.value
        }
      })),
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
      }, {
        label: 'Check Google ↗️',
        link: `https://www.google.com/search?q=vue+${this.filter}`
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
  }
}
