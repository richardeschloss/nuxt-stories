/*
 * nuxt-stories module (https://www.npmjs.com/package/nuxt-stories)
   Copyright 2020 Richard Schloss (https://github.com/richardeschloss)
   Licensed under MIT (https://github.com/richardeschloss/nuxt-stories/blob/master/LICENSE)
 */

import Debug from 'debug' 
import { register } from './module.register'

const debug = Debug('nuxt-stories')

export default function(moduleOptions) {
  const options = { ...this.options.stories, ...moduleOptions }
  const {
    forceBuild,
    lang = 'en',
    codeStyle = 'darcula',
    storiesDir = 'stories',
    storiesAnchor = storiesDir
  } = options

  if (process.env.NODE_ENV !== 'development' && !forceBuild) return

  debug('nuxt stories module enabled')
  const pOptions = { storiesAnchor, storiesDir, lang, codeStyle }
  const { srcDir } = this.options

  register.css(this, codeStyle)
  register.templates(this, {
    dirs: ['components', 'utils'], 
    files: ['plugin.register.js']
  })
  register.modules(this, [
    'bootstrap-vue/nuxt', 
    'nuxt-socket-io'
  ])
  register.plugins(this, pOptions)
  register.middlewares(this, storiesDir)

  this.nuxt.hook('modules:done', async (moduleContainer) => {
    const storyRoutes = await register.routes({
      srcDir,
      lang,
      storiesDir,
      storiesAnchor
    }) 
    moduleContainer.extendRoutes((routes, resolve) => {
      routes.push(storyRoutes)
      debug('storyRoutes created', storyRoutes)
    })
  })

  debug('nuxt stories plugin added', pOptions)
}
