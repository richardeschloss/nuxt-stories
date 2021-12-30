import Debug from 'debug'
import { storeData } from './storage.js'

const debug = Debug('nuxt-stories')

export const transformers = {
  text: res => res.text(),
  json: res => res.json()
}

let _parsers
export function useParsers (parsers) {
  _parsers = parsers
}

export async function initTransformers () {
  if (!transformers.csv) {
    const { parse: csvParse } = await import('./csvParse.sync.js')
    transformers.csv = res => res.text()
      .then(csvIn => csvParse(csvIn, { columns: true }))
  }

  if (!process.client) {
    if (!transformers.xml) {
      const { parseStringPromise: parseXML } = await import('xml2js')
      transformers.xml = res => res.text().then(parseXML)
    }
  }
}

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
  await initTransformers()
  const p = []
  const allResp = {}
  const entries = Object.entries(fetchInfo)
  entries.forEach(([key, entry]) => {
    if (!entry) { return }
    const { fetchUrl, transform, dest } = parseEntry({ entry, ctx, origin })
    const opts = parseFetchOpts({ fetchOpts: fetchOpts[key], ctx })

    debug('Fetching...', fetchUrl)
    p.push(
      fetch(fetchUrl, opts)
        .then(transformers[transform])
        .then((resp) => {
          debug('data fetched from', fetchUrl, resp)
          if (process.client) {
            ctx.$store.commit('$nuxtStories/SET_FETCHED', {
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
          } else {
            notify({ key, resp, dest })
            allResp[key] = resp
          }
        })
        .catch(err => notify({ key, resp: err.message }))
    )
  })
  return Promise.all(p).then(() => allResp)
}
