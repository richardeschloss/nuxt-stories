import Debug from 'debug'
import Vue from 'vue'
import { mapState } from 'vuex'
import Fetch from './fetch.js'

const debug = Debug('nuxt-stories')

Vue.config.errorHandler = (err, vm, info) => {
  debug('Vue error', err.message, vm, info)
  if (info === 'render') {
    // We re-throw the error again so that the page still stays alive,
    // but the user sees the error message in the dev console.
    // Otherwise, the page would just keep on crashing without a graceful means to exit.
    // throw new Error(err)
    debug(err)
  }
}

Vue.config.warnHandler = (err, vm, info) => {
  debug('Vue warning', err)
}

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

export async function LoadDeps ({ cfg = {}, frontMatter = {} }) {
  const imported = {}
  if (!cfg.fetch) { return }

  if (frontMatter.imports) {
    const p = Object.entries(frontMatter.imports).map(async ([name, imp]) => {
      const comp = await import(
        /* @vite-ignore */
        imp + '?t=' + Date.now()
      ).catch(() => {})
      imported[name] = comp
      Vue.component(name, comp.default || comp)
    })
    await Promise.all(p)
  }
  return {
    imported
  }
}

export default function ({ cfg = {}, frontMatter = {}, imported = {}, render, staticRenderFns }) {
  return {
    name: 'StoryFactory',
    data () {
      return {
        ...imported,
        ...frontMatter
      }
    },
    async fetch () {
      if (!cfg.fetch) { return }
      const ctx = this

      if (frontMatter.fetch) {
        await Fetch({
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
