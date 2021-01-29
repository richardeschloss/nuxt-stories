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

export default function ({ cfg = {}, frontMatter = {}, render, staticRenderFns }) {
  return {
    data () {
      return { ...frontMatter, imported: {} }
    },
    fetch () {
      if (!cfg.fetch) { return }
      const ctx = this
      if (process.client && frontMatter.components) {
        /* Import components */
        // send msg to server to nodeFetch
        // save to components/imported
        // lookup with Vue.component(name)    
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
    methods: {
      importIt(name) {
        const { extendOptions } = Vue.component(name)
        const { _Ctor, ...rest } = extendOptions
        rest.methods = Object.entries(rest)
          .reduce((arr, [key, val]) => {
            if (typeof val === 'function') {
              arr.push(key)
            }
            return arr
          }, [])
        this.$set(this.imported, name, rest)
        console.log('imported?', this.imported)
      }
    },
    render,
    staticRenderFns
  }
}
