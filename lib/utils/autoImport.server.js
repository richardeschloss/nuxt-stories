import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { get as getS } from 'https'
import { get } from 'http'
import { resolve as pResolve, parse as pParse } from 'path'
// eslint-disable-next-line node/no-deprecated-api
import { parse as urlParse } from 'url'

export function fetchComponents ({
  destDir = pResolve('./components/nuxtStories'),
  components,
  origin
}) {
  mkdirSync(destDir, { recursive: true })
  const p = components.map(([fName, url]) => {
    const { protocol, pathname } = urlParse(url)
    const { ext } = pParse(pathname)
    const dest = pResolve(destDir, fName + ext)
    if (!existsSync(dest)) {
      const fetchUrl = protocol
        ? url
        : `${origin}/${url}`
      const getFn = fetchUrl.startsWith('https')
        ? getS
        : get
      return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-console
        console.log(`${fetchUrl} --> ${dest}`)
        getFn(fetchUrl, (res) => {
          const outStream = createWriteStream(dest)
          res.pipe(outStream)
          outStream.on('close', resolve)
        }).on('error', reject)
      })
    }
  })
  return Promise.all(p)
}
