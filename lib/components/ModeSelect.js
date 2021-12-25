// import Svg from './Svg.js'
export default {
  render (h) {
    return h('div', {
      staticClass: 'btn-group me-md-2'
    }, this.modes.map((mode) => {
      return h('button', {
        staticClass: 'btn btn-secondary',
        class: this.modeActive(mode.name) ? 'active' : '',
        on: {
          click: () => this.setViewMode(mode.name)
        }
      }, [
        // h(Svg, { // Alternative. Loads a bit faster
        //   attrs: {
        //     src: `/nuxtStories/svg/${mode.icon}.svg`
        //   }
        // })
        h('i', {
          staticClass: `bi-${mode.icon}`
        })
      ])
    })
    )
  },
  data () {
    return {
      modes: [
        { name: 'edit', icon: 'pencil' },
        { name: 'split', icon: 'layout-split' },
        { name: 'view', icon: 'eye-fill' }
      ]
    }
  },
  mounted () {
    let viewMode = 'view'
    if (process.client && localStorage.getItem('nuxtStoriesViewMode')) {
      viewMode = localStorage.getItem('nuxtStoriesViewMode')
    }
    this.setViewMode(viewMode)
  },
  methods: {
    modeActive (mode) {
      return this.$store.state && this.$store.state.$nuxtStories
        ? mode === this.$store.state.$nuxtStories.viewMode
        : false
    },
    setViewMode (mode) {
      this.$store.commit('$nuxtStories/SET_VIEW_MODE', mode)
    }
  }
}
