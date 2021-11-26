export default {
  render(h) {
    return h('ul', {
      staticClass: 'navbar-nav ml-auto me-2'
    }, [
      h('div', {
        staticClass: 'btn-group'
      }, this.modes.map(mode => {
          return h('button', {
            staticClass: 'btn btn-secondary',
            class: this.modeActive(mode.name) ? 'active' : '',
            on: {
              click: () => this.setViewMode(mode.name)
            }
          }, [h('i', {
            staticClass: `bi-${mode.icon}`
          })])
        })
      )
    ])
  },
  data() {
    return {
      modes: [
        { name: 'edit', icon: 'pencil' },
        { name: 'split', icon: 'layout-split' },
        { name: 'view', icon: 'eye-fill' }
      ]
    }
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