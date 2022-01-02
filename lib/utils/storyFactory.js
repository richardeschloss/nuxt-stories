import Debug from 'debug'
// @ts-ignore
import Vue from 'vue'
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

/**
 * @typedef FrontMatterT
 * @property {*} [imports]
 * @property {*} [fetch]
 * @property {*} [nodeFetch]
 * @property {*} [fetchOpts]
 */

/**
 *
 * @param {object} opts
 * @param {import('@nuxt/types').Context} opts.ctx
 * @param {FrontMatterT} [opts.frontMatter]
 */
export async function LoadDeps ({ ctx, frontMatter = {} }) {
  const cfg = ctx.$config.nuxtStories
  let fetched = {}
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

  if (frontMatter.fetch) {
    fetched = await Fetch({
      fetchInfo: frontMatter.fetch,
      fetchOpts: frontMatter.fetchOpts,
      ctx
    })
  }

  if (frontMatter.nodeFetch) {
    await ctx.$store.dispatch('$nuxtStories/FETCH', {
      fetchInfo: frontMatter.nodeFetch,
      fetchOpts: frontMatter.fetchOpts,
      ctx: { ...frontMatter },
      origin: window.location.origin,
      path: ctx.$route.path
    })
  }
  return {
    fetched,
    imported
  }
}

export default function ({ frontMatter = {}, imported = {}, fetched = {}, render, staticRenderFns }) {
  return {
    name: 'StoryFactory',
    data () {
      return {
        ...fetched,
        ...imported,
        ...frontMatter
      }
    },
    computed: {
      localStorage () {
        return storageToObj(global.localStorage)
      },
      sessionStorage () {
        return storageToObj(global.sessionStorage)
      }
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
