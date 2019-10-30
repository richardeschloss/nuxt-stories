/*
 * nuxt-stories module (https:// )
   Copyright 2019 Richard Schloss (https://github.com/richardeschloss)
   Licensed under MIT (https://github.com/richardeschloss/nuxt-stories/blob/master/LICENSE)
 */

import consola from 'consola'
import Glob from 'glob'
import pify from 'pify'
import { createRoutes } from '@nuxt/utils'

const glob = pify(Glob)

/* eslint-disable no-console */
export default function(moduleOptions) {
  const { forceBuild } = moduleOptions
  if (process.env.NODE_ENV !== 'development' && !forceBuild) return

  const { srcDir } = this.options
  const bootstrapMod = 'bootstrap-vue/nuxt'
  if (!this.options.modules.includes(bootstrapMod)) {
    consola.info('Bootstrap not included, adding it for nuxt-stories module')
    this.options.modules.push(bootstrapMod)
  }

  this.nuxt.hook('modules:done', async (moduleContainer) => {
    const files = await glob(`${srcDir}/.stories/**/*.{vue,js}`)
    moduleContainer.extendRoutes((routes, resolve) => {
      const srcDirResolved = resolve(srcDir).replace(/\\\\/g, '/')
      const [storyRoutes] = createRoutes({
        files: files.map((f) => f.replace(`${srcDirResolved}/`, '')),
        pagesDir: '.stories',
        srcDir
      })
      storyRoutes.name = '.stories'
      storyRoutes.path = `/${storyRoutes.name}`
      routes.push(storyRoutes)
    })
  })
}
