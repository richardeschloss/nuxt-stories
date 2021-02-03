import Vue from 'vue'
import VueJsonPretty from 'vue-json-pretty'
Vue.component("vue-json-pretty", VueJsonPretty)
Vue.component("json", VueJsonPretty)

export const autoImport = Object.freeze({
  components (r) {
    if (!global.$nsImported2) {
      global.$nsImported2 = {}
    }
    r.keys().forEach((filename) => {
      let Component = r(filename)

      Component = Component.default || Component
      Component.name =
        Component.name || filename.replace(/^.+\//, '').replace(/\.\w+$/, '')

      Vue.component(Component.name, Component)
      // TBD: might not be needed..(can just pull from Vue.component)
      if(r.id.startsWith('./components')) {
        global.$nsImported2[Component.name] = Component
      }
    })
  }
})
