import { mapState } from 'vuex'
import FetchSvc from './fetch'

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

function propByPath (obj, path) {
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
let prevScripts = []

export default function ({ cfg = {}, frontMatter = {}, render, staticRenderFns }) {
  return {
    name: 'StoryFactory',
    data () {
      return {
        imported: {},
        ...frontMatter
      }
    },
    async fetch () {
      if (!cfg.fetch) { return }
      const ctx = this
      if (cfg.dynamicImport) {
        if ((frontMatter.esm || frontMatter.npm)) {
          if (frontMatter.npm && JSON.stringify(prevNpms) !== JSON.stringify(frontMatter.npm)) {
            npmEsms = await this.$store.dispatch('$nuxtStories/FETCH_NPMS', {
              items: frontMatter.npm,
              path: this.$route.path
            })
            prevNpms = [...frontMatter.npm]
          }

          if (!frontMatter.esm) {
            frontMatter.esm = []
          }

          esms = [...frontMatter.esm, ...npmEsms]
          if (JSON.stringify(prevEsms) !== JSON.stringify(esms)) {
            await this.$store.dispatch('$nuxtStories/FETCH_ESMS', {
              items: esms
            })
            prevEsms = [...esms]
          }
        }

        if (frontMatter.script) {
          if (JSON.stringify(prevScripts) !== JSON.stringify(frontMatter.script)) {
            await this.$store.dispatch('$nuxtStories/FETCH_SCRIPTS', {
              items: frontMatter.script
            })
            prevScripts = [...frontMatter.script]
          }
        }

        if (frontMatter.components) {
          this.imported = await this.$store.dispatch('$nuxtStories/FETCH_COMPONENTS', {
            items: frontMatter.components,
            origin: window.location.origin
          })
        }
      }

      if (frontMatter.fetch) {
        await FetchSvc.fetch({
          fetchInfo: frontMatter.fetch,
          fetchOpts: frontMatter.fetchOpts,
          ctx,
          // eslint-disable-next-line no-console
          notify: console.error
        })
      }

      if (frontMatter.nodeFetch) {
        await this.$store.dispatch('$nuxtStories/FETCH', {
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
          return propByPath(state, `$nuxtStories.fetched.${this.$route.path}`) || {}
        }
      })
    },
    render,
    staticRenderFns
  }
}
