import Vue from 'vue'
import VueJsonPretty from 'vue-json-pretty'
Vue.component('json', VueJsonPretty)

export const autoImport = Object.freeze({
  components (r) {
    r.keys().forEach((filename) => {
      let Component = r(filename)

      Component = Component.default || Component
      Component.name =
        Component.name || filename.replace(/^.+\//, '').replace(/\.\w+$/, '')

      Vue.component(Component.name, Component)
    })
  }
})
