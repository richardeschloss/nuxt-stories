import path from 'path'
import test from 'ava'
// @ts-ignore
import Module, { register, db } from '#root/lib/module.js'
import { wrapModule } from '../utils/module.js'

global.__dirname = 'lib'
const srcDir = path.resolve('.')

test('Module (defaults)', (t) => {
  const ctx = wrapModule(Module)
  ctx.Module({})
  t.falsy(ctx.options.publicRuntimeConfig.nuxtStories)
})

test('Module (enabled, ssr mode)', async (t) => {
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

test('Module (enabled, various ioOpts)', async (t) => {
  const ctx = wrapModule(Module)
  await ctx.Module({
    forceBuild: true,
    ioOpts: {
      host: 'localhost',
      port: 3001
    }
  })
  const [{ name, url }] = ctx.options.io.sockets
  t.is(name, 'nuxtStories')
  t.is(url, 'http://localhost:3001') 

  const ctx2 = wrapModule(Module)
  await ctx2.Module({
    forceBuild: true,
    ioOpts: { url: 'https://localhost:3001' }
  })
  const [{ name: name2, url: url2 }] = ctx2.options.io.sockets
  t.is(name2, 'nuxtStories')
  t.is(url2, 'https://localhost:3001') 

  const ctx3 = wrapModule(Module)
  ctx3.options.server = {
    https: true,
    port: 3001,
    host: 'localhost'
  }

  await ctx3.Module({
    forceBuild: true,
    // ioOpts: { host: 'https://localhost:3001' }
  })
  const [{ name: name3, url: url3 }] = ctx3.options.io.sockets
  t.is(name3, 'nuxtStories')
  t.is(url3, 'https://localhost:3002')

})

test('Module (enabled, static host)', async (t) => {
  const ctx = wrapModule(Module)
  await ctx.Module({
    forceBuild: true,
    staticHost: 'http://localhost:3001'
  })
  const routes = []
  Object.assign(ctx, {
    extendRoutes(cb) {
      cb(routes)  
    }
  })

  await ctx.nuxt.hooks['modules:done'](ctx)
  t.is(ctx.options.modules.length, 0)
})

test('Register.db', async (t) => {
  const cfg = {
    srcDir,
    storiesDir: 'stories'
  }
  await register.db(cfg)
  t.true(db.cnt() > 0)
})

test('Register.routes', async (t) => {
  const cfg = {
    srcDir,
    lang: 'en',
    storiesDir: 'stories',
    staticHost: false
  }
  const routes = await register.routes(cfg)
  t.is(routes.path, '/stories')
  t.is(routes.children[0].path, ':lang?/:L0?/:L1?')
})

test('Register.stories (requires db)', async (t) => {
  const stories = await register.stories('en')
  t.true(stories.length > 0)
})