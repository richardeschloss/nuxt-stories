import { h } from 'vue'
import Collapse from './Collapse.js'
import HeaderOverflow from './HeaderOverflow.js'
import Logo from './Logo.js'
import ModeSelect from './ModeSelect.js'
import Search from './Search.js'
import Svg from './Svg.js'

export default {
  render () {
    const { lang } = this.$route.params
    const { storiesAnchor } = this.$config.nuxtStories
    const brandLink = h('a', {
      class: 'navbar-brand p-0 me-2',
      href: `/${storiesAnchor}/${lang}/`
    }, [
      h(Logo),
      'Nuxt Stories'
    ])
    return h('nav', {
      class: 'navbar navbar-expand-md navbar-dark bg-dark bd-navbar'
    }, [
      h('div', {
        class: 'container-fluid'
      }, [
        brandLink,
        h(ModeSelect),
        h(Search, {
          class: 'mt-2 mt-md-0'
        }),
        h('button', {
          class: 'navbar-toggler mt-2',
          onClick: () => {
            this.showOverflow = !this.showOverflow
            // TBD: use event bus
            // this.$root.$emit('nuxtStories_toggleSideNav', this.showOverflow)
          }
        }, [
          h(Svg, {
            icon: 'list'
          })
        ]),
        h(Collapse, {
          class: 'navbar-collapse',
          show: this.showOverflow
        }, () => [
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
