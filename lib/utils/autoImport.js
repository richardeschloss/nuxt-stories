import Vue from 'vue'

export const autoImport = Object.freeze({
  components(r) {
    r.keys().forEach((filename) => {
      let Component = r(filename)

      Component = Component.default || Component
      Component.name =
        Component.name || filename.replace(/^.+\//, '').replace(/\.\w+$/, '')

      Vue.component(Component.name, Component)
    })
  }
})
