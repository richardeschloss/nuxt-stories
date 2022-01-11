import Fetch from './fetch.js'

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

  // if (frontMatter.imports) { // TBD: disabling for now
  //   const p = Object.entries(frontMatter.imports).map(async ([name, imp]) => {
  //     const comp = await import(
  //       '../../' + imp + '.js?t=' + Date.now()
  //     ).catch(() => {})
  //     imported[name] = comp
  //     Vue.component(name, comp.default || comp)
  //   })
  //   await Promise.all(p)
  // }

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

export default function ({ frontMatter = {}, imported = {}, fetched = {}, render }) {
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
