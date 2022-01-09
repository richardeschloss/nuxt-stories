import { h } from 'vue'
import Collapse from './Collapse.js'
import HeaderOverflow from './HeaderOverflow.js'
import Logo from './Logo.js'
import ModeSelect from './ModeSelect.js'
import Search from './Search.js'
import Svg from './Svg.js'

export default {
  render () {
    return h('div', 'HEADER')
    const { storiesAnchor, lang } = this.$config.nuxtStories // TBD: lang from route params
    const brandLink = h('a', {
      staticClass: 'navbar-brand p-0 me-2',
      attrs: {
        href: `/${storiesAnchor}/${lang}/`
      }
    }, [
      h(Logo),
      'Nuxt Stories'
    ])
    return h('nav', {
      staticClass: 'navbar navbar-expand-md navbar-dark bg-dark bd-navbar'
    }, [
      h('div', {
        staticClass: 'container-fluid'
      }, [
        brandLink,
        h(ModeSelect),
        h(Search, {
          staticClass: 'mt-2 mt-md-0'
        }),
        h('button', {
          staticClass: 'navbar-toggler mt-2',
          on: {
            click: () => {
              this.showOverflow = !this.showOverflow
              this.$root.$emit('nuxtStories_toggleSideNav', this.showOverflow)
            }
          }
        }, [
          h(Svg, {
            attrs: {
              icon: 'list'
            }
          })
        ]),
        h(Collapse, {
          staticClass: 'navbar-collapse',
          attrs: {
            show: this.showOverflow
          }
        }, [
          h(HeaderOverflow)
        ])
      ])
    ])
  },
  data () {
    return {
      showOverflow: false
    }
  },
  mounted () {
    this.updateOverflow()
    window.addEventListener('resize', this.updateOverflow)
  },
  destroyed () {
    window.removeEventListener('resize', this.updateOverflow)
  },
  methods: {
    updateOverflow () {
      this.showOverflow = window.innerWidth > 768
    }
  }
}
