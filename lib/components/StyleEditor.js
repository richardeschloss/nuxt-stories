import { h } from 'vue'
import { delay } from 'les-utils/utils/promise.js'
const styles = {
  bold: 'font-weight: bold;',
  italic: 'font-style: italic;',
  underline: 'text-decoration: underline;'
}
const labels = {
  bold: 'B',
  italic: 'I',
  underline: 'U'
}
const regex = {
  color: /^color:\s*(.+);/m,
  'background-color': /^background-color:\s*(.+);/m
}

function standardizeColor (str) {
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.fillStyle = str
  return ctx.fillStyle
}

export default {
  render () {
    const btnElms = ['bold', 'italic', 'underline'].map((btn) => {
      return h('button', {
        class: 'btn btn-light btn-outline-dark' +
          (this.formatting[btn] ? ' active' : ''),
        style: styles[btn],
        onClick: () => {
          this.formatting[btn] = !this.formatting[btn]
          if (this.formatting[btn]) {
            this.state.activeStyle += '\r\n' + styles[btn]
          } else {
            const r = new RegExp('\r*\n*' + styles[btn] + '\r*\n*')
            this.state.activeStyle = this.state.activeStyle
              .replace(r, '')
          }
          this.setStyles()
        }
      }, labels[btn])
    })

    const formatToolbar = h('div', {
      class: 'btn-toolbar'
    }, [
      h('div', {
        class: 'btn-group'
      },
      [
        ...btnElms,
        h('label', 'FG'),
        h('input', {
          type: 'color',
          value: this.selectedFGColor,
          onInput: (evt) => {
            this.selectedFGColor = evt.target.value
            const matched = this.state.activeStyle.match(regex.color)
            if (matched) {
              this.state.activeStyle = this.state.activeStyle
                .replace(regex.color, `color: ${this.selectedFGColor};`)
            } else {
              this.state.activeStyle += `color: ${this.selectedFGColor};`
            }
            this.setStyles()
          }
        }),
        h('label', 'BG'),
        h('input', {
          type: 'color',
          value: this.selectedBGColor,
          onInput: (evt) => {
            this.selectedBGColor = evt.target.value
            const matched = this.state.activeStyle.match(regex['background-color'])
            if (matched) {
              this.state.activeStyle = this.state.activeStyle
                .replace(regex['background-color'], `background-color: ${this.selectedBGColor};`)
            } else {
              this.state.activeStyle += `background-color: ${this.selectedBGColor};`
            }
            this.setStyles()
          }
        })
      ])
    ])
    const styleInput = h('textarea', {
      class: 'form-control',
      style: {
        height: '300px'
      },
      value: this.state.activeStyle,
      onInput: (evt) => {
        this.state.activeStyle = evt.target.value
        this.updateBtns()
        this.setStyles()
      }
    })

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
        }, 'Style Editor'),
        h('span', { class: 'ms-2' }, `${this.state.stylingSelector}`)
      ]),
      h('div', {
        class: 'modal-body'
      }, [
        formatToolbar,
        styleInput
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
        'background-color': false,
        selectedBGColor: '',
        selectedFGColor: ''
      }
    }
  },
  watch: {
    'state.viewMode' (_, o) {
      if (o === 'edit') {
        this.initStyles()
      }
    },
    'state.stylingSelector' () {
      this.initStyles()
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
    this.state.styles = JSON.parse(localStorage.getItem('styles') || '{}')
    this.state.stylingSelector = localStorage.getItem('stylingSelector')
    this.state.activeStyle = localStorage.getItem('activeStyle')
    this.initStyles()
  },
  methods: {
    updateBtns () {
      ['bold', 'italic', 'underline'].forEach((btn) => {
        this.formatting[btn] = this.state.activeStyle.includes(styles[btn])
      })
    },
    async initStyles () {
      await delay(500)
      Object.entries(this.state.styles).forEach(([selector, style]) => {
        const elm = document.querySelector(selector)
        if (elm) {
          if (selector === this.state.stylingSelector) {
            this.state.stylingElm = elm
          }
          elm.style = style
        }
      })
      this.updateBtns()
      const matchedFGColor = this.state.activeStyle.match(regex.color)
      if (matchedFGColor) {
        this.selectedFGColor = standardizeColor(matchedFGColor[1])
      }

      const matchedBGColor = this.state.activeStyle.match(regex['background-color'])
      if (matchedBGColor) {
        this.selectedBGColor = standardizeColor(matchedBGColor[1])
      } else {
        this.selectedBGColor = 'unset'
      }
    },
    setStyles () {
      if (this.state.stylingElm) {
        this.state.stylingElm.style = this.state.activeStyle
        this.state.styles[this.state.stylingSelector] = this.state.activeStyle
        localStorage.setItem('stylingSelector', this.state.stylingSelector)
      }
      localStorage.setItem('activeStyle', this.state.activeStyle)
      localStorage.setItem('styles', JSON.stringify(this.state.styles))
    }
  }
}
