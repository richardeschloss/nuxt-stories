import { resolve } from 'path'
import Debug from 'debug'

const debug = Debug('nuxt-stories')
const srcDir = resolve('.')

export default function T() {
  let tests = [], _testFile
  return {
    async load(testFile) {
      debug('importing tests from', testFile)
      tests = (await import(`${srcDir}/test/${testFile}`)).default    
      _testFile = testFile
    },
    loaded(testFile) {
      return _testFile === testFile
    },
    async run(notify = (_) => {}) {
      debug('running tests', _testFile)
      let useTests
      useTests = Object.entries(tests).filter(([test]) => !test.startsWith('skip]'))
      const only = useTests.filter(([test]) => test.startsWith('only]'))
      if (only && only.length > 0) {
        useTests = only
      }

      const results = await Promise.all(
        useTests.map(async ([name, fn]) => {
          const ctx = {}
          try {
            const resp = await fn(ctx)
            console.log('resp', resp)
            notify({ name, resp, ctx })
            return { name, resp, ctx }
          } catch (err) {
            console.log('err', err, err.message)
            notify({ name, err })
            return { name, err, errMsg: err.message, ctx }
          }
        })
      )
      return results
    }
  }  
}

// const t = T() 
// await t.load('/specs/tmp.spec.js')
// await t.run()