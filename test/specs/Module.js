// import {} from 'assert'
import { useNuxt } from '@nuxt/kit'
import { initNuxt } from '../utils/module.js'
import Module from '../../lib/module.js'

global.__dirname = 'lib'

export const beforeEach = () => {
  initNuxt()
}

export const serial = {
  async 'Normal Mode' () {
    await Module({
      forceBuild: true,
      ioOpts: {
        url: 'http://localhost:4444'
      }
    }, useNuxt())
    const nuxt = useNuxt()
    return !!nuxt.options.publicRuntimeConfig.nuxtStories
  },
  async 'Disabled Mode' () {
    await Module({}, useNuxt())
    const nuxt = useNuxt()
    return !nuxt.options.publicRuntimeConfig.nuxtStories
  }
}
