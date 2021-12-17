import Vue from 'vue'
import { testImports } from '../utils/aliases.js'

export default function T() {
  let tests, _test, Comp
  return {
    async load(testFile, componentName) {      
      tests = await testImports[testFile]()
      _test = testFile
      Comp = Vue.component(componentName)
    },
    loaded(testFile) {
      return _test === testFile
    },
    async run(notify = (_) => {}) {
      let useTests
      useTests = Object.entries(tests).filter(([test]) => !test.startsWith('skip]'))
      const only = useTests.filter(([test]) => test.startsWith('only]'))
      if (only && only.length > 0) {
        useTests = only
      }

      const results = await Promise.all(
        useTests.map(async ([name, fn]) => {
          const ctx = {
            Comp
          }
          try {
            const s = Date.now()
            const resp = await fn(ctx)
            const e = Date.now()
            notify({ name, resp, ctx, duration: e - s })
            return { name, resp, ctx, duration: e - s }
          } catch (err) {
            notify({ name, err })
            return { name, err, errMsg: err.message, ctx }
          }
        })
      )
      return results
    }
  }
}