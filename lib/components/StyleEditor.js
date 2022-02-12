import { h, nextTick } from 'vue'
import { delay } from 'les-utils/utils/promise.js'
import GoogleFonts from '../assets/googleFonts.json'
import ColorPicker from './ColorPicker/index.js'
import Draggable from './Draggable.js'
import Dropdown from './Dropdown.js'
import FilterDropdown from './FilterDropdown.js'

// console.log('GoogleFonts', GoogleFonts)

const fontCheck = new Set([
  // Windows 10
  'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima', 'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 'Ink Free', 'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings', 'Yu Gothic',
  // macOS
  'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate', 'Courier', 'Courier New', 'Didot', 'DIN Alternate', 'DIN Condensed', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Microsoft Sans Serif', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'Savoye LET', 'SignPainter', 'Skia', 'Snell Roundhand', 'Tahoma', 'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino'
].sort())

// https://fonts.google.com/metadata/fonts
// from google...
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
  cssProp: 'font-weight',
  activeVal: 'bold'
}, {
  label: 'I',
  cssProp: 'font-style',
  activeVal: 'italic'
}, {
  label: 'U',
  cssProp: 'text-decoration',
  activeVal: 'underline'
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
  // let useStr = str
  // if (str.startsWith('rgba')) {
  //   useStr = str
  //     .replace('rgba', 'rgb')
  //     .split(',').slice(0, 3).join(',') + ')'
  // }
  const ctx = document.createElement('canvas').getContext('2d')
  ctx.fillStyle = str
  return ctx.fillStyle
}

export default {
  render () {
    const ctx = this
    const stdStyleElms = stdStyles.map(({ label, cssProp, activeVal }) => {
      return h('button', {
        class: 'btn btn-light btn-outline-dark' +
          (this.btnStyles[cssProp] ? ' active' : ''),
        style: `${cssProp}: ${activeVal}`,
        onClick: () => this.toggleStdStyle(cssProp, activeVal)
      }, label)
    })

    const fontInput = h('input', {
      list: 'nuxt-stories-font-select',
      class: 'form-control',
      value: '',
      // onClick: (evt) => {
      //   evt.target.value = ''
      // },
      onInput: (evt) => {
        console.log('value', evt.target.value)
        console.log('evt', evt)
      }
    })

    const availableFonts = this.fonts.map((font) => {
      return h('option', {
        value: font
      })
    })
    const installedFonts = this.fonts.map((font) => {
      return {
        label: font,
        value: font
      }
    })
    const googleFontsX = GoogleFonts.map(({ family, category }) => {
      return h('option', {
        value: `  ${family}, ${category.toLowerCase()}`
      })
    })
    const googleFonts = GoogleFonts.map(({ family, category }) => {
      return {
        family,
        category,
        label: `${family}, ${category.toLowerCase()}`,
        google: true
      }
    })

    const fontSelectXX = h('datalist', {
      id: 'nuxt-stories-font-select'
    }, [
      ...availableFonts,
      h('option', {
        value: '--- Google Fonts ---'
      }),
      ...googleFonts
    ])
    const fontSelect = h(FilterDropdown, {
      initVal: {
        label: this.btnStyles['font-family']
      },
      items: [
        ...installedFonts,
        { label: '--- Google Fonts --- ', disabled: true },
        ...googleFonts
      ],
      onItemSelected: (info) => {
        console.log('item selected', info)
      }
    })
    console.log(fontSelect.props)

    const fontSize = h('input', {
      type: 'number'
      // value: this.formatting['font-size']
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
        class: 'btn btn-light btn-outline-dark',
        style: {
          'background-color': this.btnStyles[cssProp] ? this.btnStyles[cssProp] : null
        },
        title: hint,
        onClick: () => {
          this.showColorPicker[cssProp] = true
        }
      }, [
        h('span', {}, label),
        h(Draggable, {
          style: {
            display: this.showColorPicker[cssProp] ? 'block' : 'none',
            position: 'fixed',
            bottom: 0,
            right: 0,
            width: '220px'
          }
        }, () => h(ColorPicker, {
          label: hint,
          onClose: () => {
            this.showColorPicker[cssProp] = false
          },
          onChangeColor: info => ctx.handleColorInput(info, cssProp)
        }))

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
      commitBtn,
      // fontInput,
      fontSelect,
      // fontSize,

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
      onMouseenter: this.expandModal
      // onMouseleave: this.collapseModal // TBD: resotre
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
      showColorPicker: {},
      modalWidth: '15%',
      modalHeight: '10%',
      zIndex: 1054,
      btnStyles: {
        'font-weight': null,
        'font-style': null,
        'text-decoration': null,
        color: null, // '#000000',
        'background-color': null, // '#ffffff',
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
    'state.stylingSelector' () {
      localStorage.setItem('stylingSelector', this.state.stylingSelector)
      this.initStyles()
    }
  },
  mounted () {
    this.expandModal() // TBD: revert
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
    handleColorInput (info, cssProp) {
      const { r, g, b, a } = info.rgba
      this.appliedStyles[cssProp] = `rgba(${r}, ${g}, ${b}, ${a})`
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
      if (!process.client) { return }
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
      if (this.stylingElms[0]) {
        this.appliedStyles = toStyleJson(this.stylingElms[0])
        this.initStdBtns()
        this.initColorBtns()
        this.initFontInput()
      }
    },
    initStdBtns () {
      const computedStyle = window.getComputedStyle(this.stylingElms[0])
      stdStyles.forEach(({ cssProp: style, activeVal }) => {
        const useVal = this.appliedStyles[style] !== null
          ? this.appliedStyles[style]
          : computedStyle[style]
        this.btnStyles[style] = useVal === activeVal
          ? activeVal
          : null
      })
    },
    initColorBtns () {
      const computedStyle = window.getComputedStyle(this.stylingElms[0])
      colors.forEach(({ cssProp: style }) => {
        const useVal = this.appliedStyles[style]
          ? this.appliedStyles[style]
          : computedStyle[style]
        this.btnStyles[style] = useVal
      })
    },
    initFontInput () {
      const computedStyle = window.getComputedStyle(this.stylingElms[0])
      const style = 'font-family'
      const useVal = this.appliedStyles[style]
        ? this.appliedStyles[style]
        : computedStyle[style]
      this.btnStyles[style] = useVal
      console.log('useVal', useVal)
    },
    toggleStdStyle (key, val) {
      this.btnStyles[key] = this.btnStyles[key] !== val ? val : null
      this.appliedStyles[key] = this.btnStyles[key]
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
        this.initStdBtns()
        this.initColorBtns()
        if (this.state.stylingSelector) {
          this.state.styles[this.state.stylingSelector] = this.input
          localStorage.setItem('styles', JSON.stringify(this.state.styles))
        }
      }
    }
  }
}
