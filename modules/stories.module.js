import consola from 'consola'
import Glob from 'glob'
import pify from 'pify'
import { createRoutes } from '@nuxt/utils'

const glob = pify(Glob)

/* eslint-disable no-console */
export default function(moduleOptions) {
  const { forceBuild } = moduleOptions
  if (process.env.NODE_ENV !== 'development' && !forceBuild) return

  const bootstrapMod = 'bootstrap-vue/nuxt'
  if (!this.options.modules.includes(bootstrapMod)) {
    consola.info('Bootstrap not included, adding it for nuxt-stories module')
    this.options.modules.push(bootstrapMod)
  }

  this.nuxt.hook('modules:done', async (moduleContainer) => {
    console.log(moduleContainer)
    const { srcDir } = this.options
    const files = await glob(`${srcDir}/.stories/**/*.{vue,js}`)
    const [storyRoutes] = createRoutes({
      files: files.map((f) => f.replace(`${srcDir}/`, '')),
      srcDir
    })
    storyRoutes.name = '.stories'
    storyRoutes.path = `/${storyRoutes.name}`
    moduleContainer.extendRoutes((routes) => {
      routes.push(storyRoutes)
    })
  })
}
