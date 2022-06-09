import { unlinkSync, writeFileSync } from 'fs'
import path from 'path'
import ava from 'ava'
// @ts-ignore
import { initNuxt, useNuxt } from '../utils/module.js'
import Module, { register, db } from '#root/lib/module.js'

global.__dirname = 'lib'
const srcDir = path.resolve('.')

const { beforeEach, after } = ava
const test = ava

beforeEach('Init Nuxt', () => {
  initNuxt()
})

after(() => {
  unlinkSync(path.resolve('./lib/assets/css/appliedStyles.css'))
})

test('Module (disabled mode)', async (t) => {
  await Module({ forceBuild: false }, useNuxt())
  t.falsy(useNuxt().options.runtimeConfig.public.nuxtStories)
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

  t.is(nuxt.options.devServerHandlers[0].route, '/nuxtStories')

  const routes = []
  nuxt.hooks['pages:extend'](routes)
  const dirs = []
  nuxt.hooks['components:dirs'](dirs)
  const fnd = dirs.find(({ prefix }) => prefix === 'NuxtStories')
  t.truthy(fnd)

  t.is(nuxt.options.plugins.at(-1).src, path.resolve(__dirname, 'plugin.js'))
  t.is(routes[0].name, 'stories')
  t.is(routes[0].path, '/stories')
  t.is(routes[0].meta.layout, 'stories')

  t.truthy(nuxt.options.runtimeConfig.public.nuxtStories)
  const [{ name, url }] = nuxt.options.io.sockets
  t.is(name, 'nuxtStories')
  t.is(url, 'http://localhost:3100')

  const readmeMware = nuxt.options.devServerHandlers.find(({ route }) =>
    route === '/nuxtStories/README.md'
  )
  const mockRes = {
    pathname: '/',
    write () {},
    writeHead () {},
    end () {}
  }
  let handled = 0
  nuxt.options.devServerHandlers.forEach(({ handler }) => {
    // @ts-ignore
    handler({ method: 'POST' }, mockRes, () => {
      handled++
    })
  })
  t.is(handled, 4)
  let callCnt = 0
  readmeMware.handler(null, {
    writeHead () {},
    write (contents) {
      t.true(contents.length > 0)
    },
    end () { callCnt++ }
  }, () => { callCnt++ })
  t.is(callCnt, 2)
})

test('Module (enabled, various ioOpts)', async (t) => {
  initNuxt()
  const nuxt = useNuxt()
  nuxt.options.io = { server: false }
  await Module({
    forceBuild: true,
    ioOpts: {
      host: 'localhost',
      port: 4000
    }
  }, nuxt)
  const [{ name, url }] = useNuxt().options.io.sockets
  t.is(name, 'nuxtStories')
  t.is(url, 'http://localhost:4000')

  initNuxt()
  await Module({
    forceBuild: true,
    ioOpts: { url: 'https://localhost:3002' }
  }, useNuxt())

  const [{ name: name2, url: url2 }] = useNuxt().options.io.sockets
  t.is(name2, 'nuxtStories')
  t.is(url2, 'https://localhost:3002')

  initNuxt()
  // @ts-ignore
  useNuxt()
    .options.server = {
      https: true,
      port: 4001,
      host: 'localhost'
    }

  await Module({
    forceBuild: true,
    ioOpts: { url: 'https://localhost:4101' }
  }, useNuxt())

  const [{ name: name3, url: url3 }] = useNuxt().options.io.sockets
  t.is(name3, 'nuxtStories')
  t.is(url3, 'https://localhost:4101')

  // Attempt to register io again...
  // It should catch error
  await register.ioServer(useNuxt())
  // debug logs and coverage report shows it's caught
  t.pass()

  initNuxt()
  useNuxt().options.target = 'static'
  await Module({
    forceBuild: true,
    ioOpts: { url: 'https://localhost:4101' }
  }, useNuxt())
  t.false(nuxt.options.io.server)
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
  t.is(routes.children[0].path, ':lang')
  t.is(routes.path, '/stories')
  t.is(routes.children[0].children[0].path, ':catchAll(.*)*')
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
  const stories = (await p).stories
  const fnd = stories.find(({ name }) => name === 'Tmp')
  t.truthy(fnd)
  unlinkSync(tmpStory)
})
