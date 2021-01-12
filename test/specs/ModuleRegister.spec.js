import { readFileSync, readdirSync } from 'fs'
import http from 'http'
import { resolve as pResolve } from 'path'
import test from 'ava'
import { register, storyPath } from '@/lib/module.register'

test('Full Story path', (t) => {
  const srcDir = '/some/dir'
  const mdPath = 'myStory.md'
  register.options({ srcDir })
  const fullPath = storyPath(mdPath)
  t.is(fullPath, `${srcDir}/${mdPath}`)
})

test('Register css', (t) => {
  const ctx = {
    options: {
      css: []
    }
  }
  const codeStyle = 'someStyle'
  register.css(ctx, codeStyle)
  t.is(ctx.options.css[0], `highlight.js/styles/${codeStyle}.css`)
})

test('Register io', (t) => {
  const server = http.createServer()
  const serverOpts = {
    host: 'localhost',
    port: 3000
  }
  const ctx1 = {
    options: {
      server: serverOpts
    }
  }

  register.io({ ctx: ctx1, server })
  t.truthy(ctx1.options.io)
  t.is(ctx1.options.io.sockets[0].name, 'nuxtStories')
  t.is(ctx1.options.io.sockets[0].url, `${serverOpts.host}:${serverOpts.port + 1}`)
  server.close()

  const ctx2 = {
    options: {
      io: {
        sockets: [{
          name: 'alreadyExists'
        }]
      },
      server: serverOpts
    }
  }

  register.io({ ctx: ctx2, server })
  t.truthy(ctx2.options.io)
  t.is(ctx2.options.io.sockets[1].name, 'nuxtStories')
  t.is(ctx2.options.io.sockets[1].url, `${serverOpts.host}:${serverOpts.port + 1}`)
  server.close()

  const ioOpts = {
    port: 3002
  }
  register.io({ ctx: ctx2, ioOpts, server })
  t.truthy(ctx2.options.io)
  t.is(ctx2.options.io.sockets[2].name, 'nuxtStories')
  t.is(ctx2.options.io.sockets[2].url, `${serverOpts.host}:${ioOpts.port}`)
  server.close()

  const ctx3 = {
    options: {}
  }
  const server3 = http.createServer()
  const ioOpts3 = {
    url: 'https://somehost'
  }
  register.io({ ctx: ctx3, ioOpts: ioOpts3, server: server3 })
  t.false(server3.listening)
  t.truthy(ctx3.options.io)
  t.is(ctx3.options.io.sockets[0].url, ioOpts3.url)

  const ctx4 = {
    options: {}
  }
  const server4 = http.createServer()
  const ioOpts4 = {}
  register.io({ ctx: ctx4, ioOpts: ioOpts4, server: server4 })
  t.false(server4.listening)
  t.falsy(ctx4.options.io.sockets[0])
})

test('Register middlewares', (t) => {
  const middlewares = []
  const ctx = {
    addServerMiddleware (middleware) {
      middlewares.push(middleware)
    }
  }
  register.middlewares(ctx, 'stories')
  t.is(middlewares[0].path, '/markdown')
  t.is(middlewares[0].handler.name, 'serveStatic')
})

test('Register modules', (t) => {
  const ctx = {
    options: {
      modules: []
    },
    addModule (mod) {
      ctx.options.modules.push(mod)
    }
  }
  register.modules(ctx)
  t.is(ctx.options.modules.length, 0)

  const expectedMods = ['bootstrap-vue/nuxt', 'nuxt-socket-io']
  for (let i = 0; i < 2; i++) {
    register.modules(ctx, expectedMods)
    expectedMods.forEach((mod, idx) => {
      t.is(ctx.options.modules[idx], mod)
    })
  }
})

test('Register plugins', (t) => {
  const plugins = []
  const pOptions = {
    someData: 123
  }
  const ctx = {
    addPlugin (plugin) {
      plugins.push(plugin)
    }
  }
  register.plugins(ctx, pOptions)
  t.true(plugins[0].ssr)
  t.is(plugins[0].src, pResolve('./lib/stories.plugin.js'))
  t.is(plugins[0].fileName, 'nuxt-stories/plugin.js')
  t.is(plugins[0].options.someData, pOptions.someData)
})

test('Register templates', (t) => {
  const dirs = ['components', 'utils']
  const files = ['plugin.register.js']
  const templates = []
  const ctx = {
    addTemplate (template) {
      templates.push(template)
    }
  }
  register.templates(ctx, { dirs, files })
  let tIdx = 0
  dirs.forEach((dir) => {
    const dirFiles = readdirSync(pResolve('lib', dir))
    dirFiles.forEach((f) => {
      t.is(templates[tIdx].src, pResolve('lib', dir, f))
      t.is(templates[tIdx].fileName, `nuxt-stories/${dir}/${f}`)
      tIdx++
    })
  })

  files.forEach((f) => {
    t.is(templates[tIdx].src, pResolve('lib', f))
    t.is(templates[tIdx].fileName, `nuxt-stories/${f}`)
  })
})

test('Register routes (dynamic)', async (t) => {
  const srcDir = pResolve('.')
  const storiesDir = 'stories'
  const lang = 'en'
  const storiesAnchor = storiesDir
  register.options({ srcDir })
  const { routes: storyRoute, stories } = await register.routes({
    lang,
    storiesDir,
    storiesAnchor
  })

  t.is(storyRoute.name, storiesDir)
  t.is(storyRoute.path, `/${storiesDir}`)
  t.is(
    storyRoute.component,
    pResolve(srcDir, `lib/components/StoriesRoot.vue`)
  )
  t.is(storyRoute.chunkName, `stories`)
  t.true(storyRoute.children.length > 0)

  const lastChild = storyRoute.children[storyRoute.children.length - 1]
  t.is(lastChild.name, 'Markdown')
  t.is(lastChild.path, ':lang?/:L0?/:L1?')
  t.is(lastChild.chunkName, `${storiesDir}/lang/L0/L1`)
  t.is(lastChild.component, pResolve(srcDir, 'lib/components/StoryMarkdown.vue'))

  function testStory (s, idx) {
    t.truthy(s.name)
    t.truthy(s.path)
    t.truthy(s.children)
    t.true(Array.isArray(s.idxs))
    t.truthy(s.frontMatter)
    if (s.mdPath) {
      t.is(typeof s.mdPath, 'string')
      t.true(s.mdPath.endsWith('.md'))
    }
    s.children.forEach(testStory)
  }

  stories.forEach(testStory)
})

test('Register routes (static)', async (t) => {
  const srcDir = pResolve('.')
  const storiesDir = 'stories'
  const lang = 'en'
  const storiesAnchor = storiesDir
  register.options({ srcDir })
  const { routes: storyRoute, stories } = await register.routes({
    lang,
    storiesDir,
    storiesAnchor,
    staticHost: true
  })
  t.is(storyRoute.name, storiesDir)
  t.is(storyRoute.path, `/${storiesDir}`)
  t.is(
    storyRoute.component,
    pResolve(srcDir, `lib/components/StoriesRoot.vue`)
  )
  t.is(storyRoute.chunkName, `stories`)
  t.true(storyRoute.children.length > 0)

  function testStory (s, idx) {
    t.truthy(s.name)
    t.truthy(s.path)
    t.truthy(s.children)
    t.true(Array.isArray(s.idxs))
    t.truthy(s.frontMatter)
    if (s.mdPath) {
      t.is(typeof s.mdPath, 'string')
      t.true(s.mdPath.endsWith('.md'))
    }
    s.children.forEach(testStory)
  }

  stories.forEach(testStory)

  const allStories = JSON.parse(readFileSync(pResolve(srcDir, storiesDir, 'stories.json')))

  t.truthy(allStories.en)
  t.truthy(allStories.es)
})

test('Replace backslashes (for windows)', (t) => {
  const srcDir = 'C:\\some\\win\\path'
  const srcDirOut = srcDir.replace(/\\/g, '/')
  t.is(srcDirOut, 'C:/some/win/path')
})
