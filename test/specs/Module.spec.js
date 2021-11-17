/* eslint-disable no-console */
import path from 'path'
import test from 'ava'
import config from '#root/nuxt.config.js'
import Module from '#root/lib/module.js'
import { wrapModule } from '../utils/module.js'

global.__dirname = 'lib'

const srcDir = path.resolve('.')

/** @type {import('../../lib/types').moduleOptions} */
const modOptions = {}

test('Module (defaults)', (t) => {
  const ctx = wrapModule(Module)
  ctx.Module({})
  t.falsy(ctx.options.publicRuntimeConfig.nuxtStories)
})

test.only('Module (enabled, ssr mode)', async (t) => {
  const ctx = wrapModule(Module)
  ctx.Module({
    forceBuild: true
  })
  const expMods = ['nuxt-socket-io']
  expMods.forEach((mod, idx) => {
    t.is(ctx.options.modules[idx], mod)
  })
  const expHooks = ['component:dirs', 'modules:done']
  expHooks.forEach((h) => {
    t.truthy(ctx.nuxt.hooks[h])
  })

  t.is(ctx.options.middlewares[0].path, '/markdown')

  const dirs = []
  ctx.nuxt.hooks['component:dirs'](dirs)
  t.is(dirs[0].path, path.resolve(__dirname, 'components'))
  t.is(dirs[0].prefix, 'NuxtStories')
  
  const routes = []
  Object.assign(ctx, {
    extendRoutes(cb) {
      cb(routes)  
    }
  })

  await ctx.nuxt.hooks['modules:done'](ctx)
  t.true(ctx.options.plugins[0].ssr)
  t.is(ctx.options.plugins[0].src, path.resolve(__dirname, 'plugin.js'))
  t.is(ctx.options.plugins[0].fileName, 'nuxt-stories/plugin.js')
  t.is(routes[0].name, 'stories')
  t.is(routes[0].path, '/stories')

  t.truthy(ctx.options.publicRuntimeConfig.nuxtStories)
})
