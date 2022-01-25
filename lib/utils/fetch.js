import Debug from 'debug'
import { storeData } from './storage.js'

const debug = Debug('nuxt-stories')

export const transformers = {
  text: res => res.text(),
  json: res => res.json()
}

export async function initTransformers () {
  const { parse: csvParse } = await import('./csvParse.sync.js')
  transformers.csv = res => res.text()
    .then(csvIn => csvParse(csvIn, { columns: true }))

  const { parseXML } = await import('les-utils/utils/string.js')
  transformers.xml = res => res.text().then(parseXML)
}
initTransformers()

function parseEntry ({ entry, ctx, origin }) {
  const [subEntry, dest] = entry.split(/\s*>\s*/)
  const parts = subEntry.split(/\s*\|\s*/)
  let fetchUrl = parts[0]
    .replace(/(:[A-z]+)/g, param => ctx[param.slice(1)])
    .replace(/(\$[A-z]+)/g, param => process.env[param.slice(1)])

  if (!process.client) {
    try {
      // eslint-disable-next-line no-unused-vars
      const urlParsed = new URL(fetchUrl)
      // successful parse means fetchUrl is structured ok
    } catch (err) {
      if (origin) {
        fetchUrl = `${origin}${fetchUrl}`
      }
    }
  }

  const transform = parts[1] || 'text'
  return { fetchUrl, transform, dest }
}

/*
 * Parse the fetch options for a given request, if any.
 * For example: sometimes request headers need to be sent.
 * This is where they get parsed from the frontMatter entries.
 */
function parseFetchOpts ({ fetchOpts, ctx }) {
  if (!fetchOpts) { return }
  if (typeof fetchOpts === 'string') {
    if (fetchOpts.startsWith(':')) {
      return ctx[fetchOpts.slice(1)]
    }
  } else {
    return fetchOpts
  }
}

/*
 * Set fetched for a given route path and key:
 * i.e., state.fetched['/stories/en/example1'].item1 = resp
 */
export function setFetched (state, { path, key, resp }) {
  if (!state.fetched[path]) {
    state.fetched[path] = {}
  }

  state.fetched[path][key] = resp

  // If the active story removes fetch or nodeFetch
  // entries from frontMatter, pluck those from state
  if (state.activeStory?.frontMatter) {
    const { fetch: f = [], nodeFetch: nF = [] } = state.activeStory.frontMatter
    const fetchProps = [...Object.keys(f), ...Object.keys(nF)]
    const storedProps = Object.keys(state.fetched[path])
    storedProps.forEach((p) => {
      if (!fetchProps.includes(p)) {
        delete state.fetched[path][p]
      }
    })
  }
}

export function handleResp ({ ctx, key, resp, dest }) {
  const state = ctx.$nuxtStories().value
  setFetched(state, {
    path: ctx.$route.path,
    key,
    resp
  })
  if (dest) {
    storeData(dest, {
      item: 'fetched',
      path: ctx.$route.path,
      key,
      data: resp
    })
  }
}

/**
 * Info can either be in the following formats:
 * 1) Object (values are the urls, keys represent the names to store in)
 * (alternate formats planned)
 *
 * If the value contains a "|" the string will be split and the
 * left substring will be the url, the right substring will be one of the
 * transformers to use: "text", "json", "csv" or "xml"
 *
 * @param {object} info
 * * @param {object} info.fetchInfo
 * * @param {object} info.fetchOpts
 * * @param {object} [info.origin]
 * * @param {object} info.ctx
 * @param {function} [info.notify]
 */
export default async function Fetch ({ fetchInfo, fetchOpts = {}, origin, ctx, notify }) {
  const allResp = {}
  const entries = Object.entries(fetchInfo)
  const p = entries.map(async ([key, entry]) => {
    if (!entry) { return }
    const { fetchUrl, transform, dest } = parseEntry({ entry, ctx, origin })
    const opts = parseFetchOpts({ fetchOpts: fetchOpts[key], ctx })

    debug('Fetching...', fetchUrl)
    const resp = await fetch(fetchUrl, opts)
      .then(transformers[transform])
      .catch((err) => {
        if (notify) {
          notify({ key, resp: err.message })
        }
      })
    debug('data fetched from', fetchUrl, resp)
    if (process.client) {
      handleResp({ ctx, key, resp, dest })
    }
    if (notify && resp) {
      notify({ key, resp, dest })
    }
    allResp[key] = resp
  })
  await Promise.all(p)
  return allResp
}
