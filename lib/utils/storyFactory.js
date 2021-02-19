import { mapState } from 'vuex'
import FetchSvc from './fetch'
import Vue from 'vue'

const storageToObj = storage => storage
  ? Object.entries({ ...storage })
    .reduce((obj, [key, val]) => {
      try {
        obj[key] = JSON.parse(val)
      } catch (err) {
        obj[key] = val
      }
      return obj
    }, {})
  : {}

function propByPath(obj, path) {
  return path.split('.').reduce((out, prop) => {
    if (out !== undefined && out[prop] !== undefined) {
      return out[prop]
    }
  }, obj)
}

let prevEsms = []
let prevNpms = []
let npmEsms = []
let esms = []

export default function ({ cfg = {}, frontMatter = {}, render, staticRenderFns }) {
  return {
    name: 'StoryFactory',
    data () {
      return { 
        ...frontMatter, 
        imported: {}, 
        vuesFetched: false, 
        npmsFetched: false, 
        scriptsFetched: false 
      }
    },
    async fetch () {
      if (!cfg.fetch) { return }
      const ctx = this
      if ((frontMatter.esm || frontMatter.npm) ){
        if (frontMatter.npm && JSON.stringify(prevNpms) !== JSON.stringify(frontMatter.npm)) { 
          npmEsms = await this.$store.dispatch('$nuxtStories/FETCH_NPMS', {
            items: frontMatter.npm,
            path: this.$route.path
          })
          prevNpms = [...frontMatter.npm]
        }

        esms = [...frontMatter.esm, ...npmEsms]
        if (JSON.stringify(prevEsms) !== JSON.stringify(esms)) {
          this.$store.dispatch('$nuxtStories/FETCH_ESMS', {
            items: esms,
            path: this.$route.path
          })
          prevEsms = [...esms]
        }
      }

      if (frontMatter.scripts) {
        this.scriptsFetched = false
        this.$store.dispatch('$nuxtStories/FETCH_SCRIPTS', {
          scripts: frontMatter.scripts,
          origin: window.location.origin,
          path: this.$route.path
        }).then(() => {
          this.scriptsFetched = true
        })
      }

      if (frontMatter.components) {
        this.$store.dispatch('$nuxtStories/FETCH_COMPONENTS', {
          components: frontMatter.components,
          origin: window.location.origin,
          path: this.$route.path
        }).then(() => {
          this.imported = this.$store.state.$nuxtStories.components // [this.$route.path]
        })
      }

      if (frontMatter.vues) {
        this.vuesFetched = false
        this.$store.dispatch('$nuxtStories/FETCH_VUES', {
          vues: frontMatter.vues,
          origin: window.location.origin,
          path: this.$route.path
        }).then(() => {
          this.vuesFetched = true
        })
      }

      if (frontMatter.fetch) {
        FetchSvc.fetch({
          fetchInfo: frontMatter.fetch,
          fetchOpts: frontMatter.fetchOpts,
          ctx,
          // eslint-disable-next-line no-console
          notify: console.error
        })
      }

      if (frontMatter.nodeFetch) {
        this.$store.dispatch('$nuxtStories/FETCH', {
          fetchInfo: frontMatter.nodeFetch,
          fetchOpts: frontMatter.fetchOpts,
          ctx: { ...frontMatter },
          origin: window.location.origin,
          path: this.$route.path
        })
      }
    },
    computed: {
      localStorage () {
        return storageToObj(global.localStorage)
      },
      sessionStorage () {
        return storageToObj(global.sessionStorage)
      },
      ...mapState({
        esmsFetched (state) {
          const prop = propByPath(state, `$nuxtStories.esmsFetched.${this.$route.path}`)
          return prop !== undefined && Object.values(prop).reduce((out, val) => out && val, true)
        },
        fetched (state) {
          return state &&
            state.$nuxtStories &&
            state.$nuxtStories.fetched &&
            state.$nuxtStories.fetched[this.$route.path]
            ? state.$nuxtStories.fetched[this.$route.path]
            : {}
        }
      })
    },
    render,
    staticRenderFns
  }
}
