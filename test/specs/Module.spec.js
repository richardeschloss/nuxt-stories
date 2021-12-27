import { unlinkSync, writeFileSync } from 'fs'
import path from 'path'
import ava from 'ava'
// @ts-ignore
import { initNuxt, useNuxt } from '../utils/module.js'
import Module, { register, db } from '#root/lib/module.js'

global.__dirname = 'lib'
const srcDir = path.resolve('.')

const { beforeEach } = ava
const test = ava

beforeEach('Init Nuxt', () => {
  initNuxt()
})

test('Module (defaults)', async (t) => {
  await Module({}, useNuxt())
  t.falsy(useNuxt().options.publicRuntimeConfig.nuxtStories)
})

test('Module (enabled, ssr mode)', async (t) => {
  // t.timeout(5000)
  const nuxt = useNuxt()
  // @ts-ignore
  nuxt.options.server = {
    host: 'localhost',
    port: 3000
  }
  await Module({
    forceBuild: true
  })
  const expMods = ['nuxt-socket-io']
  expMods.forEach((mod, idx) => {
    t.is(nuxt.options.modules[idx], mod)
  })
  const expHooks = ['components:dirs', 'modules:done']
  expHooks.forEach((h) => {
    t.truthy(nuxt[h])
  })

  t.is(nuxt.options.serverMiddleware[0].path, '/nuxtStories')

  const dirs = []
  nuxt['components:dirs'](dirs)
  t.is(dirs[0].path, path.resolve(__dirname, 'components'))
  t.is(dirs[0].prefix, 'NuxtStories')

  const routes = []
  const moduleContainer = {
    nuxt,
    extendRoutes (cb) {
      cb(routes)
    }
  }

  await nuxt['modules:done'](moduleContainer)
  t.is(nuxt.options.plugins[0].src, path.resolve(__dirname, 'plugin.js'))
  t.is(routes[0].name, 'stories')
  t.is(routes[0].path, '/stories')

  t.truthy(nuxt.options.publicRuntimeConfig.nuxtStories)
  const [{ name, url }] = nuxt.options.io.sockets
  t.is(name, 'nuxtStories')
  t.is(url, 'http://localhost:3100')
})

test('Module (enabled, various ioOpts)', async (t) => {
  await Module({
    forceBuild: true,
    ioOpts: {
      host: 'localhost',
      port: 3001
    }
  }, useNuxt())
  const [{ name, url }] = useNuxt().options.io.sockets
  t.is(name, 'nuxtStories')
  t.is(url, 'http://localhost:3001')

  initNuxt()
  await Module({
    forceBuild: true,
    ioOpts: { url: 'https://localhost:3001' }
  }, useNuxt())
  const [{ name: name2, url: url2 }] = useNuxt().options.io.sockets
  t.is(name2, 'nuxtStories')
  t.is(url2, 'https://localhost:3001')

  initNuxt()
  // @ts-ignore
  useNuxt()
    .options.server = {
      https: true,
      port: 3001,
      host: 'localhost'
    }

  await Module({
    forceBuild: true
    // ioOpts: { host: 'https://localhost:3001' }
  }, useNuxt())
  const [{ name: name3, url: url3 }] = useNuxt().options.io.sockets
  t.is(name3, 'nuxtStories')
  t.is(url3, 'https://localhost:3101')

  // Attempt to register io again...
  // It should catch error
  register.io(useNuxt())
  t.pass()
})

test('Module (enabled, static host)', async (t) => {
  await Module({
    forceBuild: true,
    staticHost: 'http://localhost:3001'
  }, useNuxt())
  const nuxt = useNuxt()
  t.is(nuxt.options.modules.length, 0)
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
  t.is(routes.children[0].path, ':lang?/*')
})

test('Register.stories (requires db)', async (t) => {
  const stories = await register.stories('en')
  t.true(stories.length > 0)
})

test('Watch Stories', async (t) => {
  function waitForFileChanged (db) {
    return new Promise((resolve) => {
      function fileChanged (stories) {
        db.off('fileChanged', fileChanged)
        resolve(stories)
      }
      db.on('fileChanged', fileChanged)
    })
  }
  await Module({
    forceBuild: true,
    watchStories: true
  }, useNuxt())
  const p = waitForFileChanged(db)
  const tmpStory = path.resolve('./stories/en/Tmp.md')
  writeFileSync(tmpStory, 'Some content')
  const stories = await p
  const fnd = stories.find(({ name }) => name === 'Tmp')
  t.truthy(fnd)
  unlinkSync(tmpStory)
})
