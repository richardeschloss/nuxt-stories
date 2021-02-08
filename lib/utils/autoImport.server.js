import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { get as getS } from 'https'
import { get as get } from 'http'
import { resolve as pResolve, parse as pParse } from 'path'
import { parse as urlParse } from 'url'

export function fetchComponents({ 
  destDir = pResolve('./components/nuxtStories'),
  components, 
  origin
}) {  
  // TBD: mkdirp...  (mkdirSync with { recursive: true } does the error handling)
  console.log('fetch!', components)
  mkdirSync(destDir, { recursive: true })  
  const p = Object.entries(components).map(([fName, url]) => {
    // TBD: saving .vue or .js files
    const { protocol, pathname } = urlParse(url)
    const { ext } = pParse(pathname)
    const dest = pResolve(destDir, fName + ((ext === '') ? '.js' : ext))
    if (!existsSync(dest)) {
      const outStream = createWriteStream(dest)
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
