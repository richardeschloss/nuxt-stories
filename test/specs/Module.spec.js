/* eslint-disable no-console */
import path from 'path'
import test from 'ava'
import config from '#root/nuxt.config.js'
import Module from '#root/lib/module.js'
import { wrapModule } from '../utils/module.js'
import { wrapPlugin } from '../utils/plugin.js'
import io from 'socket.io-client'
import Plugin from 'nuxt-socket-io/lib/plugin.js'

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
  t.timeout(5000)
  const ctx = wrapModule(Module)
  Object.assign(ctx.options, {
    server: {
      host: 'localhost',
      port: 3000  
    }
  })
  await ctx.Module({
    forceBuild: true
  })
  const expMods = ['nuxt-socket-io']
  expMods.forEach((mod, idx) => {
    t.is(ctx.options.modules[idx], mod)
  })
  const expHooks = ['components:dirs', 'modules:done']
  expHooks.forEach((h) => {
    t.truthy(ctx.nuxt.hooks[h])
  })

  t.is(ctx.options.middlewares[0].path, '/markdown')

  const dirs = []
  ctx.nuxt.hooks['components:dirs'](dirs)
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
  const [{ name, url }] = ctx.options.io.sockets
  t.is(name, 'nuxtStories')
  t.is(url, 'http://localhost:3001')  
})


// TBD: save for io.js test
  /* 
  const client = wrapPlugin(Plugin)
  client.$config = {
    io: ctx.options.io,
    nuxtSocketIO: {}
  }
  client.Plugin(null, client.inject)
  const s = client.$nuxtSocket({ 
    channel: '/',
    namespaceCfg: {
      emitters: ['fetchStories']
    } 
  })
  const stories = await client.fetchStories({
    srcDir
  })
  console.log('stories', stories)
  */