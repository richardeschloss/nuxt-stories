import path from 'path'
import { nuxtCtx, useNuxt } from '@nuxt/kit'

const srcDir = path.resolve('.')

export { useNuxt }

export function initNuxt () {
  nuxtCtx.unset()
  const nuxt = {
    __nuxt2_shims_key__: true,
    version: '2.x',
    hooks: {
      addHooks: (hooks) => {
        Object.assign(useNuxt(), hooks)
      }
    },
    hook (evt, cb) {
      nuxtCtx.use().hooks[evt] = cb
    },
    options: {
      css: [],
      srcDir,
      plugins: [],
      modules: [],
      serverMiddleware: [],
      build: {
        transpile: [],
        templates: []
      },
      publicRuntimeConfig: {}
    }
  }
  // @ts-ignore
  nuxtCtx.set(nuxt)
}
