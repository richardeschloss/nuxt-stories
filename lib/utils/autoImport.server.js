import { createWriteStream, existsSync } from 'fs'
import { get as getS } from 'https'
import { get as get } from 'http'
import { resolve as pResolve } from 'path'
import { parse as urlParse } from 'url'
import mkdirp from 'mkdirp'

const destDir = pResolve('./components/imported') // TBD: from options?

export function fetchComponents({ components, origin }) {  
  console.log('fetch!', components)  
  const p = Object.entries(components).map(([fName, url]) => {
    // TBD: saving .vue or .js files
    const dest = pResolve(destDir, fName + '.js')
    if (!existsSync(dest)) {
      const outStream = createWriteStream(dest)
      const { protocol, pathname } = urlParse(url)
      const fetchUrl = protocol
        ? url
        : `${origin}/${url}`
      const getFn = fetchUrl.startsWith('https')
        ? getS
        : get
      return new Promise((resolve) => {
        console.log(`${fetchUrl} --> ${dest}`)
        getFn(fetchUrl, (res) => {
          res.pipe(outStream)
          outStream.on('close', resolve)
        })
      })
    }
  })
  return Promise.all(p) 
}