import { readdirSync, mkdirSync, writeFileSync, unlinkSync } from 'fs'
import { exec } from 'child_process'
import http from 'http'
import { resolve as pResolve, parse as pParse } from 'path'
import { promisify } from 'util'
import Glob from 'glob'
import test from 'ava'
import { register } from '@/lib/module.register'

const glob = promisify(Glob)

async function getStoriesRoot (srcDir, storiesDir, lang = 'en') {
  const files = await glob(`${srcDir}/${storiesDir}/${lang}/**/*.{vue,js}`)
  return pParse(files[0]).base.replace('.vue', '')
}

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
  register.io(ctx1, server)
  const { host: h1, port: p1 } = ctx1.options.server
  t.truthy(ctx1.options.io)
  t.is(ctx1.options.io.sockets[0].name, 'nuxtStories')
  t.is(ctx1.options.io.sockets[0].url, `${serverOpts.host}:${serverOpts.port + 1}`)
  server.close()

  register.io(ctx2, server)
  const { host: h2, port: p2 } = ctx2.options.server
  t.truthy(ctx2.options.io)
  t.is(ctx2.options.io.sockets[1].name, 'nuxtStories')
  t.is(ctx2.options.io.sockets[1].url, `${serverOpts.host}:${serverOpts.port + 1}`)
  server.close()
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
  const serverOpts = { host: 'localhost', port: 4000 }
  const server = http.createServer()
  const ctx = {
    options: {
      server: serverOpts,
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
    register.modules(ctx, ['bootstrap-vue/nuxt', 'nuxt-socket-io'], server)
    server.close()
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

test('Register routes', async (t) => {
  const srcDir = pResolve('.')
  const storiesDir = 'stories'
  const lang = 'en'
  const storiesAnchor = storiesDir
  const storiesRoot = await getStoriesRoot(srcDir, storiesDir)
  const storyRoute = await register.routes({
    srcDir,
    lang,
    storiesDir,
    storiesAnchor
  })
  t.is(storyRoute.name, storiesDir)
  t.is(storyRoute.path, `/${storiesDir}`)
  t.is(
    storyRoute.component,
    pResolve(srcDir, `${storiesDir}/${lang}/${storiesRoot}.vue`)
  )
  t.is(storyRoute.chunkName, `${storiesDir}/${lang}/${storiesRoot}`)
  t.truthy(storyRoute.children)
  t.true(storyRoute.children.length > 0)

  function testChild (child) {
    if (child.meta) {
      // We only add meta on the Markdown routes
      // And we re-use the same Markdown Vue component to load
      // different markdown files
      t.is(child.component, pResolve(srcDir, `lib/components/StoryMarkdown.vue`))
      t.truthy(child.meta.mdPath)
      t.truthy(child.meta.mdSavePath)
      t.truthy(child.meta.frontMatter)
      t.true(child.meta.idxs.length > 0)

      if (child.children) {
        child.children.forEach(testChild)
      }
    }
  }

  storyRoute.children.forEach(testChild)

  const badDir = 'storiesNotExist'
  await register.routes({
    srcDir,
    lang,
    storiesDir: badDir,
    storiesAnchor
  }).catch((err) => {
    t.is(err.message, `Error: Story routes not created. Does the stories directory ${badDir} exist?`)
  })
})

test.only('Register routes (bad path)', async (t) => {
  mkdirSync('/tmp/stories')
  mkdirSync('/tmp/stories/en')
  writeFileSync('/tmp/stories/en/index.vue')
  const srcDir = pResolve('/tmp')
  const storiesDir = 'stories'
  const lang = 'en'
  const storiesAnchor = storiesDir
  const storiesRoot = await getStoriesRoot(srcDir, storiesDir)
  const storyRoute = await register.routes({
    srcDir,
    lang,
    storiesDir,
    storiesAnchor
  })
  t.is(storyRoute.children.length, 0)
  exec('rm -rf /tmp/stories')   
})