/*
 * nuxt-stories module (https://www.npmjs.com/package/nuxt-stories)
   Copyright 2021 Richard Schloss (https://github.com/richardeschloss)
   Licensed under MIT (https://github.com/richardeschloss/nuxt-stories/blob/master/LICENSE)
 */

import Debug from 'debug'
import { register } from './module.register'

const debug = Debug('nuxt-stories')

export default function (moduleOptions) {
  const options = { ...this.options.stories, ...moduleOptions }
  const {
    forceBuild,
    lang = 'en',
    codeStyle = 'darcula',
    storiesDir = 'stories',
    storiesAnchor = storiesDir,
    ioOpts,
    markdown,
    staticHost,
    fetch: _fetch = true
  } = options

  if (process.env.NODE_ENV !== 'development' && !forceBuild) { return }

  debug('nuxt stories module enabled')
  const { srcDir } = this.options
  const pOptions = {
    storiesAnchor,
    storiesDir,
    lang,
    codeStyle,
    ioOpts,
    markdown,
    staticHost,
    fetch: _fetch
  }
  register.options({ srcDir, ...pOptions })

  register.css(this, codeStyle)
  register.templates(this, {
    dirs: ['components', 'utils', 'store'],
    files: ['plugin.register.js']
  })

  const mods = ['bootstrap-vue/nuxt']
  if (!staticHost) {
    register.io({ ctx: this, ioOpts })
    mods.push('nuxt-socket-io')
  }
  register.modules(this, mods)
  register.middlewares(this, storiesDir, staticHost)

  this.nuxt.hook('modules:done', async (moduleContainer) => {
    const { routes: storyRoutes, stories } = await register.routes({ ...pOptions })
    pOptions.stories = stories
    register.plugins(this, pOptions)

    moduleContainer.extendRoutes((routes, resolve) => {
      routes.push(storyRoutes)
    })
  })

  debug('nuxt stories plugin added', pOptions)
}
