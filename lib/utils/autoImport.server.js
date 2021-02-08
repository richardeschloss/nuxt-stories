import { createWriteStream, existsSync } from 'fs'
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

export function fetchScripts({ 
  destDir = pResolve(__dirname, '../cache'), //static/imported'), 
  scripts,
  origin
}) {  
  console.log('fetch!', scripts)
  const p = scripts.map((url) => {
    const { protocol, pathname } = urlParse(url)
    const parts = pathname.split('/')
    const dest = pResolve(destDir, parts[parts.length - 1]) 
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