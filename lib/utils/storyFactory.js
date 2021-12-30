import { mapState } from 'vuex'
import FetchSvc from './fetch.js'

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
    staticRenderFns,
    methods: {
      componentNames (includes = '') {
        const components = []
        for (const c in this.$options.components) {
          if (c.includes(includes)) {
            components.push(c)
          }
        }
        return components
      }
    }
  }
}
