import { h } from 'vue'
import Svg from './Svg.js'
export default {
  render () {
    return h('div', {
      class: 'btn-group me-md-2'
    }, this.modes.map((mode) => {
      return h('button', {
        class: 'btn btn-secondary ' + (this.modeActive(mode.name) ? 'active' : ''),
        onclick: () => this.setViewMode(mode.name)
      }, [
        h(Svg, {
          icon: mode.icon
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
      return this.$nuxtStories().value?.viewMode === mode
    },
    setViewMode (mode) {
      this.$nuxtStories().value.viewMode = mode
    }
  }
}
