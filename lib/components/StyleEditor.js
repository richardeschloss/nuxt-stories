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

const stdStyles = [{
  label: 'B',
  activeStyle: 'font-weight: bold'
}, {
  label: 'I',
  activeStyle: 'font-style: italic'
}, {
  label: 'U',
  activeStyle: 'text-decoration: underline'
}]

const colors = [{
  hint: 'Text Color',
  label: 'Text',
  cssProp: 'color'
}, {
  hint: 'Background Color',
  label: 'BKG',
  cssProp: 'background-color'
}]

function toStyleJson (elm) {
  const styles = elm.getAttribute('style')
  if (!styles || styles === '') { return {} }
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
    const ctx = this
    const stdStyleElms = stdStyles.map(({ label, activeStyle }) => {
      const [key, val] = activeStyle.split(/\s*:\s*/)
      return h('button', {
        class: 'btn btn-light btn-outline-dark' +
          (this.appliedStyles[key] === val ? ' active' : ''),
        style: activeStyle,
        onClick: () => this.toggleStdStyle(key, val)
      }, label)
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
      type: 'number',
      value: this.formatting['font-size']
      // onInput: this.updateFontSize
    })

    const formatToolbar = h('div', {
      class: 'btn-toolbar d-inline'
    }, [
      h('div', {
        class: 'btn-group'
      }, stdStyleElms)
    ])

    const colorBtns = colors.map(({ hint, label, cssProp }) => {
      return h('button', {
        title: hint
      }, [
        label,
        h('input', {
          class: 'w-100',
          value: this.appliedStyles[cssProp]
            ? standardizeColor(this.appliedStyles[cssProp])
            : '#000000',
          type: 'color',
          onInput: evt => ctx.handleColorInput(evt, cssProp)
        })
      ])
    })
    const colorToolbar = h('div', {
      class: 'btn-toolbar d-inline'
    }, [
      h('div', {
        class: 'btn-group'
      }, colorBtns)
    ])
    const styleInput = h('textarea', {
      id: 'nuxt-stories-applied-styles',
      class: 'form-control',
      style: {
        height: '300px'
      },
      value: this.input,
      onInput: this.handleInput
    })

    const commitBtn = h('button', {
      class: 'btn btn-light btn-outline-dark',
      onClick: this.commitChanges
    }, '💾')
    const modalHeader = h('div', {
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
    ])
    const modalBody = h('div', {
      class: 'modal-body'
    }, [
      formatToolbar,
      colorToolbar,
      // fontSelect,
      // fontSize,
      commitBtn,
      styleInput
    ])

    return h('div', {
      id: 'style-editor',
      class: 'nuxt-stories modal',
      style: {
        'z-index': this.zIndex,
        background: 'white',
        width: this.modalWidth,
        height: this.modalHeight,
        'box-shadow': '0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%), 0px 5px 5px -3px rgb(0 0 0 / 20%)',
        transition: 'width 0.3s ease, height 0.3s ease'
      },
      onMouseenter: this.expandModal,
      onMouseleave: this.collapseModal
    }, [
      modalHeader,
      modalBody
    ])
  },
  data () {
    return {
      input: '',
      typing: false,
      appliedStyles: {},
      stylingElms: [],
      styles: {},
      state: this.$nuxtStories(),
      modalWidth: '15%',
      modalHeight: '10%',
      zIndex: 1054,
      formatting: { // TBD: formatCtrls (just keys?)
        'font-weight': null,
        'font-style': null,
        'text-decoration': null,
        color: '#000000',
        'background-color': '#ffffff',
        'font-family': null,
        'font-size': null
      },
      fonts: [],
      savePath: undefined
    }
  },
  watch: {
    'state.compiledVue' (n, o) {
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
        emitters: ['saveStyles', 'updateStyle']
      }
    })
    Object.assign(this.$el.style, {
      display: 'block',
      right: '3%',
      left: 'unset',
      bottom: 0,
      top: 'unset'
    })
    this.fonts = listFonts()
    if (this.state.compiledVue) {
      this.initStyles()
    }
  },
  methods: {
    commitChanges () {
      // this.appliedStyles = toStyleJson(this.stylingElms[0])
      this.updateStyle({
        selector: this.state.stylingSelector,
        style: this.appliedStyles,
        path: this.savePath
      })
    },
    collapseModal () {
      this.modalWidth = '15%'
      this.modalHeight = '10%'
      this.zIndex = 1054
    },
    expandModal () {
      this.modalWidth = 'fit-content'
      this.modalHeight = '50%'
      this.zIndex = 1056
    },
    handleColorInput (evt, cssProp) {
      this.appliedStyles[cssProp] = evt.target.value
      this.input = fromStyleJson(this.appliedStyles)
      this.updateStyles()
    },
    handleInput (evt) {
      const { inputDebounceMs = 350 } = this.$config.nuxtStories
      if (this.typing !== null) {
        clearTimeout(this.typing)
      }
      this.typing = setTimeout(() => {
        this.input = evt.target.value
        this.updateStyles()
      }, inputDebounceMs)
    },
    async initStyles () {
      await nextTick()
      // Load cached styles that were previously applied
      // Record<{ [cssSelector]: style }>
      this.styles = JSON.parse(localStorage.getItem('styles') || '{}')
      // Load the last css selector
      this.state.stylingSelector = localStorage.getItem('stylingSelector')
      if (!this.state.stylingSelector) { return }
      if (!this.styles[this.state.stylingSelector]) {
        this.styles[this.state.stylingSelector] = ''
      }

      // For all cached styles, apply the styles to the found elms on the page
      Object.entries(this.styles).forEach(([selector, style]) => {
        const elms = document.querySelectorAll(selector)
        if (elms && elms.length > 0) {
          if (selector === this.state.stylingSelector) {
            // Set the elm(s) we're currently styling
            this.stylingElms = elms
            this.input = this.styles[selector]
          }
          this.updateElmsStyle(elms, style)
        }
      })
      // Load the style string in as JSON to make it easier to manage
      this.appliedStyles = toStyleJson(this.stylingElms[0])
      this.initColorBtns()
    },
    initColorBtns () {
      const computedStyle = window.getComputedStyle(this.stylingElms[0])
      colors.forEach(({ cssProp: style }) => {
        if (!this.appliedStyles[style]) {
          this.appliedStyles[style] = computedStyle[style]
        }
      })
    },
    toggleStdStyle (key, activeStyle) {
      this.appliedStyles[key] = this.appliedStyles[key] !== activeStyle ? activeStyle : null
      this.input = fromStyleJson(this.appliedStyles)
      this.updateStyles()
    },
    updateElmsStyle (elms, style) {
      elms.forEach((elm) => { elm.style = style })
    },
    updateStyles () {
      if (this.stylingElms.length > 0) {
        this.updateElmsStyle(this.stylingElms, this.input)
        const newStyles = toStyleJson(this.stylingElms[0])
        Object.assign(this.appliedStyles, newStyles)
        Object.keys(this.appliedStyles).forEach((key) => {
          if (newStyles[key] === null || newStyles[key] === undefined) {
            this.appliedStyles[key] = null
            if (key.includes('color')) {
              this.initColorBtns()
            }
          }
        })
        if (this.state.stylingSelector) {
          this.state.styles[this.state.stylingSelector] = this.input
          localStorage.setItem('styles', JSON.stringify(this.state.styles))
        }
      }
    }
  }
}
