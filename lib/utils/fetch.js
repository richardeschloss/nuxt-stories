// import { parseStringPromise as parseXML } from 'xml2js'
// import nodeFetch from 'node-fetch' // TBD: move to fetch.server
import { parse as csvParse } from './csvParse.sync.js'
import { storeData } from './storage.js'

// console.log('url', url)

const transformers = {
  csv: res => res.text().then(csvIn => csvParse(csvIn, { columns: true })),
  text: res => res.text(),
  json: res => res.json()
  // xml: res => res.text().then(parseXML)
}

function parseEntry ({ entry, ctx, origin }) {
  const [subEntry, dest] = entry.split(/\s*>\s*/)
  const parts = subEntry.split(/\s*\|\s*/)
  let fetchUrl = parts[0]
    .replace(/(:[A-z]+)/g, param => ctx[param.slice(1)])
    .replace(/(\$[A-z]+)/g, param => process.env[param.slice(1)])
  const urlParsed = new URL(fetchUrl) // TBD: test (URL now built-in)
  if (!urlParsed.hostname && !process.client) {
    fetchUrl = `${origin}${fetchUrl}`
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

export default Object.freeze({
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
   * @param {function} notify
   */
  fetch ({ fetchInfo, fetchOpts = {}, origin, ctx, notify }) {
    // if (!process.client) {
    //   global.fetch = nodeFetch
    // }
    const p = []
    const allResp = {}
    const entries = Object.entries(fetchInfo)
    entries.forEach(([key, entry]) => {
      if (!entry) { return }
      const { fetchUrl, transform, dest } = parseEntry({ entry, ctx, origin })
      const opts = parseFetchOpts({ fetchOpts: fetchOpts[key], ctx })

      p.push(
        fetch(fetchUrl, opts)
          .then(transformers[transform])
          .then((resp) => {
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
})
