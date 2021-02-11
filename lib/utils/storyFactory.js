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

export default function ({ cfg = {}, frontMatter = {}, render, staticRenderFns }) {
  return {
    name: 'StoryFactory',
    data () {
      return { 
        ...frontMatter, 
        imported: {}, 
        vuesFetched: false, 
        // esmsFetched: false, 
        npmsFetched: false, 
        scriptsFetched: false 
      }
    },
    fetch () {
      if (!cfg.fetch) { return }
      const ctx = this
      if (frontMatter.esm) {
        // this.esmsFetched = false
        this.$store.dispatch('$nuxtStories/FETCH_ESMS', {
          items: frontMatter.esm,
          origin: window.location.origin,
          path: this.$route.path,
          notify(info) {
            console.log('info rxd', info)
            ctx.$set(ctx.imported, info.aliases[0], 1111)
            console.log('imp', ctx.imported)
          }
        })
        // .then(() => {
        //   // this.esmsFetched = true
        // })
      }

      if (frontMatter.npms) {    
        this.npmsFetched = false    
        this.$store.dispatch('$nuxtStories/FETCH_NPMS', {
          npms: frontMatter.npms,
          origin: window.location.origin,
          path: this.$route.path
        }).then(() => {
          this.npmsFetched = true
        })
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
        esms (state) {
          // console.log('esms state changed', state.$nuxtStories)
          // { named1: { mod, url }, named2: { mod, url }}
          const stored = propByPath(state, `$nuxtStories.esms.${this.$route.path}`) // || {} //, this.$route.path)
          const mods = Object.entries(stored) 
            .reduce((obj, [key, val]) => {
              obj[key] = val.mod
              return obj
            }, { ...stored })
          // console.log('stored', stored, mods) //[this.$route.path])
          // Object(entries)
          return mods //stored //[this.$route.path]
          // return state &&
          //   state.$nuxtStories &&
          //   state.$nuxtStories.esms &&
          //   state.$nuxtStories.esms[this.$route.path] 
          //   ? state.$nuxtStories.esms[this.$route.path]
          //   : { }
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
    watch: {
      '$store.state'(n) {
        console.log('changed', n)
      }
    },
    mounted() {
      // const ctx = this
      // window.$nsImported = function() {
      //   ctx.imported = window.$nsImports
      // }
      // this.imported = window.$nsImported2
    },
    render,
    staticRenderFns
  }
}
