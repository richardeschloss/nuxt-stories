import Fetch, { handleResp } from './fetch.js'

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

async function fetchServer ({ ctx, ...info }) {
  const socket = ctx.$nuxtSocket({
    name: 'nuxtStories',
    persist: 'storiesSocket',
    channel: ''
  })

  if (socket.listeners('fmFetched').length === 0) {
    socket.on('fmFetched', function ({ key, resp, dest }) {
      handleResp({ ctx, key, resp, dest })
    })
  }
  const allResp = await socket.emitP('fmFetch', info)
  return allResp
}

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
  if (!cfg.fetch) { return }
  let fetched = {}; let clientFetched = {}; let serverFetched = {}
  const imported = {}

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
    clientFetched = await Fetch({
      fetchInfo: frontMatter.fetch,
      fetchOpts: frontMatter.fetchOpts,
      ctx
    })
  }

  if (frontMatter.nodeFetch) {
    serverFetched = await fetchServer({
      fetchInfo: frontMatter.nodeFetch,
      fetchOpts: frontMatter.fetchOpts,
      origin: window.location.origin,
      ctx
    })
  }
  fetched = { ...clientFetched, ...serverFetched }
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
    render
  }
}
