import path from 'path'
import { nuxtCtx, useNuxt } from '@nuxt/kit'

const srcDir = path.resolve('.')

export { useNuxt }

export function initNuxt () {
  nuxtCtx.unset()
  const nuxt = {
    version: '3.x',
    hooks: {
      addHooks: (hooks) => {
        Object.assign(useNuxt(), hooks)
      }
    },
    hook (evt, cb) {
      nuxtCtx.use().hooks[evt] = cb
    },
    options: {
      modulesDir: [],
      extensions: ['.ts', '.mjs', '.cjs', '.json'],
      target: 'server',
      css: [],
      srcDir,
      plugins: [],
      modules: [],
      devServerHandlers: [],
      build: {
        transpile: [],
        templates: []
      },
      runtimeConfig: {
        public: {}
      }
    }
  }
  // @ts-ignore
  nuxtCtx.set(nuxt)
}
