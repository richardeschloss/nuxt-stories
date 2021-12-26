import path from 'path'
import { nuxtCtx } from '@nuxt/kit'

const srcDir = path.resolve('.')

export function initNuxt () {
  nuxtCtx.unset()
  const nuxt = {
    __nuxt2_shims_key__: true,
    version: '2.x',
    hooks: {
      addHooks: () => {}
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
