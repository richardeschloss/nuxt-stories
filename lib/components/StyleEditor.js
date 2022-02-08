import { h } from 'vue'
export default {
  render () {
    return h('div', {
      id: 'style-editor',
      class: 'nuxt-stories modal show',
      style: {
        'z-index': this.zIndex,
        background: 'white',
        width: this.modalWidth,
        height: this.modalHeight,
        'box-shadow': '0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%), 0px 5px 5px -3px rgb(0 0 0 / 20%)',
        transition: 'width 0.3s ease, height 0.3s ease'
      },
      onMouseenter: () => {
        this.modalWidth = 'fit-content'
        this.modalHeight = '50%'
        this.zIndex = 1056
      },
      onMouseleave: () => {
        this.modalWidth = '15%'
        this.modalHeight = '10%'
        this.zIndex = 1054
      }
    }, [
      h('div', {
        class: 'modal-header py-1',
        style: {
          'background-color': '#343a40',
          color: 'white'
        }
      }, [
        h('h5', {
          class: 'modal-title'
        }, 'Style Editor')
      ]),
      h('div', {
        class: 'modal-body'
      }, [
        h('label', { }, 'Editing: ' + this.state.stylingSelector),
        h('div', {
          class: 'btn-toolbar'
        }, [
          h('div', {
            class: 'btn-group'
          }, [
            h('button', {
              class: 'btn btn-light btn-outline-dark',
              style: {
                'font-weight': 'bold'
              },
              onClick: () => {
                this.state.activeStyle += 'font-weight: bold;\r\n'
                this.setStyles()
              }
            }, 'B'),
            h('button', {
              class: 'btn btn-light btn-outline-dark',
              style: {
                'font-style': 'italic'
              },
              onClick: () => {
                this.formatting.italic = !this.formatting.italic
                if (this.formatting.italic) {
                  this.state.activeStyle += 'font-style: italic;\r\n'
                } else {
                  this.state.activeStyle = this.state.activeStyle
                    .replace('font-style: italic;\r\n', '')
                }

                this.setStyles()
              }
            }, 'I'),
            h('button', {
              class: 'btn btn-light btn-outline-dark',
              style: {
                'text-decoration': 'underline'
              },
              onClick: () => {
                this.state.activeStyle += 'text-decoration: underline;\r\n'
                this.setStyles()
              }
            }, 'U')
          ])
        ]),
        h('textarea', {
          class: 'form-control',
          style: {
            height: '300px'
          },
          value: this.state.activeStyle,
          onInput: (evt) => {
            this.state.activeStyle = evt.target.value
            this.setStyles()
          }
        })
      ])
    ])
  },
  data () {
    return {
      state: this.$nuxtStories(),
      modalWidth: '15%',
      modalHeight: '10%',
      zIndex: 1054,
      formatting: {
        bold: false,
        italic: false,
        underline: false,
        color: false,
        'background-color': false
      }
    }
  },
  mounted () {
    Object.assign(this.$el.style, {
      display: 'block',
      right: '3%',
      left: 'unset',
      bottom: 0,
      top: 'unset'
    })
    // this.state.stylingComp = localStorage.getItem('stylingComp')
  },
  methods: {
    setStyles () {
      if (this.state.stylingElm) {
        this.state.stylingElm.style = this.state.activeStyle
        this.state.styles[this.state.stylingSelector] = this.state.activeStyle
      }
      localStorage.setItem('activeStyle', this.state.activeStyle)
      localStorage.setItem('styles', JSON.stringify(this.state.styles))
    }
  }
}
