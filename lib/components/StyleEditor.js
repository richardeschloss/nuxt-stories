import { h, nextTick } from 'vue'
import { delay } from 'les-utils/utils/promise.js'
import Dropdown from './Dropdown.js'

const fontCheck = new Set([
  // Windows 10
  'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
  // macOS
  'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino'
].sort())

function listFonts () {
  const fontAvailable = new Set()

  for (const font of fontCheck.values()) {
    if (document.fonts.check(`12px "${font}"`)) {
      fontAvailable.add(font)
    }
  }
  return [...fontAvailable.values()]
}

const btnStyles = {
  bold: 'font-weight: bold',
  italic: 'font-style: italic',
  underline: 'text-decoration: underline'
}
const labels = {
  bold: 'B',
  italic: 'I',
  underline: 'U'
}
const regex = {
  color: /^color:\s*(.+);/m,
  'background-color': /^background-color:\s*(.+);/m,
  'font-family': /^font-family:\s*(.+);/m
}

function toStyleJson (elm) {
  const styles = elm.getAttribute('style')
  if (!styles) { return {} }
  return styles.split(/\s*;\s*/)
    .reduce((out, pair) => {
      if (pair !== '') {
        const [key, val] = pair.split(/\s*:\s*/)
        out[key] = val
      }
      return out
    }, {})
}

function fromStyleJson (json) {
  return Object.entries(json)
    .reduce((out, [key, val]) => {
      if (val) {
        out += `${key}: ${val};\r\n`
      }
      return out
    }, '')
}

function standardizeColor (str) {
  let useStr = str
  if (str.startsWith('rgba')) {
    useStr = str
      .replace('rgba', 'rgb')
      .split(',').slice(0, 3).join(',') + ')'
  }
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.fillStyle = useStr
  return ctx.fillStyle
}

export default {
  render () {
    const { inputDebounceMs = 350 } = this.$config.nuxtStories
    const btnElms = Object.entries(btnStyles).map(([btn, style]) => {
      const [key, val] = style.split(/\s*:\s*/)
      return h('button', {
        class: 'btn btn-light btn-outline-dark' +
          (this.formatting[btn] ? ' active' : ''),
        style,
        onClick: () => {
          this.formatting[btn] = !this.formatting[btn]
          this.appliedStyles[key] = this.formatting[btn] ? val : null
          this.input = fromStyleJson(this.appliedStyles)
          this.updateStyles()
        }
      }, labels[btn])
    })
    const fontSelect = h(Dropdown, {
      class: 'd-inline',
      btnClass: 'btn btn-light btn-outline-dark',
      text: this.formatting['font-family'],
      items: this.fonts.map((font) => {
        return {
          label: font,
          value: font
        }
      }),
      onItemSelected: (item) => {
        this.formatting['font-family'] = item.value
        this.appliedStyles['font-family'] = this.formatting['font-family']
        this.input = fromStyleJson(this.appliedStyles)
        this.updateStyles()
      }
    })

    const fontSize = h('input', {
      type: 'number'
    })

    const formatToolbar = h('div', {
      class: 'btn-toolbar d-inline'
    }, [
      h('div', {
        class: 'btn-group'
      },
      [
        ...btnElms
        // h('label', 'FG'),
        // h('input', {
        //   type: 'color',
        //   value: this.selectedFGColor,
        //   onInput: (evt) => {
        //     this.selectedFGColor = evt.target.value
        //     const matched = this.state.activeStyle.match(regex.color)
        //     if (matched) {
        //       this.state.activeStyle = this.state.activeStyle
        //         .replace(regex.color, `color: ${this.selectedFGColor};`)
        //     } else {
        //       this.state.activeStyle += `color: ${this.selectedFGColor};`
        //     }
        //     this.setStyles()
        //   }
        // }),
        // h('label', 'BG'),
        // h('input', {
        //   type: 'color',
        //   value: this.selectedBGColor,
        //   onInput: (evt) => {
        //     this.selectedBGColor = evt.target.value
        //     const matched = this.state.activeStyle.match(regex['background-color'])
        //     if (matched) {
        //       this.state.activeStyle = this.state.activeStyle
        //         .replace(regex['background-color'], `background-color: ${this.selectedBGColor};`)
        //     } else {
        //       this.state.activeStyle += `background-color: ${this.selectedBGColor};`
        //     }
        //     this.setStyles()
        //   }
        // })
      ])
    ])

    const colorToolbar = h('div', {
      class: 'btn-toolbar d-inline'
    }, [
      h('div', {
        class: 'btn-group'
      }, [
        h('button', {
          title: 'Text Color'
        }, [
          'Text',
          h('input', {
            class: 'w-100',
            value: this.formatting.color,
            type: 'color',
            onInput: (evt) => {
              this.formatting.color = evt.target.value
              this.appliedStyles.color = evt.target.value
              this.input = fromStyleJson(this.appliedStyles)
              this.updateStyles()
            }
          })
        ]),
        h('button', {
          title: 'Background Color'
        }, [
          'BKG',
          h('input', {
            class: 'w-100',
            value: this.formatting['background-color'],
            type: 'color',
            onInput: (evt) => {
              this.formatting['background-color'] = evt.target.value
              this.appliedStyles['background-color'] = evt.target.value
              this.input = fromStyleJson(this.appliedStyles)
              this.updateStyles()
            }
          })
        ])
      ])
    ])
    const styleInput = h('textarea', {
      id: 'nuxt-stories-applied-styles',
      class: 'form-control',
      style: {
        height: '300px'
      },
      value: this.state.activeStyle,
      onInput: (evt) => {
        if (this.typing !== null) {
          clearTimeout(this.typing)
        }
        this.typing = setTimeout(() => {
          this.input = evt.target.value
          this.updateStyles()
        }, inputDebounceMs)
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
        colorToolbar,
        fontSelect,
        // fontSize,
        styleInput
      ])
    ])
  },
  data () {
    return {
      input: '',
      typing: false,
      appliedStyles: {},
      state: this.$nuxtStories(),
      modalWidth: '15%',
      modalHeight: '10%',
      zIndex: 1054,
      formatting: {
        bold: false,
        italic: false,
        underline: false,
        color: '#000000',
        'background-color': '#ffffff',
        'font-family': null
      },
      fonts: []
    }
  },
  watch: {
    async 'state.compiledVue' (n, o) {
      if (n) {
        await nextTick()
        this.initStyles()
      }
    },
    'state.viewerMounted' (n) {
      if (n) {
        this.initStyles()
      }
    },
    'state.viewMode' (_, o) {
      if (o === 'edit') {
        // this.initStyles()
      }
    },
    'state.stylingSelector' () {
      localStorage.setItem('stylingSelector', this.state.stylingSelector)
      this.initStyles()
    }
  },
  mounted () {
    this.socket = this.$nuxtSocket({
      channel: '/styles',
      namespaceCfg: {
        emitters: ['saveStyles']
      }
    })
    this.saveStyles({
      '.someClass': 'color: red;\r\n'
    })
    Object.assign(this.$el.style, {
      display: 'block',
      right: '3%',
      left: 'unset',
      bottom: 0,
      top: 'unset'
    })
    this.state.styles = JSON.parse(localStorage.getItem('styles') || '{}')
    this.state.stylingSelector = localStorage.getItem('stylingSelector')
    this.fonts = listFonts()
    if (this.state.viewerMounted) {
      this.initStyles()
    }
  },
  methods: {
    updateToolbars () {
      Object.entries(btnStyles).forEach(([btn, style]) => {
        this.formatting[btn] = this.state.activeStyle.includes(style)
      })
      const otherStyles = [
        'font-family',
        'color',
        'background-color'
      ]
      const computedStyle = window.getComputedStyle(this.state.stylingElms[0])
      otherStyles.forEach((style) => {
        let val = this.appliedStyles[style]
          ? this.appliedStyles[style]
          : computedStyle[style]
        if (style.includes('color')) {
          val = standardizeColor(val)
        }
        this.formatting[style] = val
      })
    },
    initStyles () {
      Object.entries(this.state.styles).forEach(([selector, style]) => {
        const elms = document.querySelectorAll(selector)
        if (elms && elms.length > 0) {
          if (selector === this.state.stylingSelector) {
            this.state.activeStyle = this.state.styles[selector]
            this.state.stylingElms = elms
          }
          elms.forEach((elm) => { elm.style = style })
        }
      })
      this.appliedStyles = toStyleJson(this.state.stylingElms[0])
      this.updateToolbars()
      this.state.viewerMounted = false
    },
    updateStyles () {
      this.state.activeStyle = this.input
      if (this.state.stylingElms.length > 0) {
        this.state.stylingElms.forEach((elm) => {
          elm.style = this.state.activeStyle
        })
        this.appliedStyles = toStyleJson(this.state.stylingElms[0])
        this.updateToolbars()
        this.state.styles[this.state.stylingSelector] = this.state.activeStyle
        // localStorage.setItem('stylingSelector', this.state.stylingSelector)
      }

      localStorage.setItem('activeStyle', this.state.activeStyle)
      localStorage.setItem('styles', JSON.stringify(this.state.styles))
    }
  }
}
