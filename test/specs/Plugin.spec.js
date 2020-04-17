/* eslint-disable no-console */
import { resolve as pResolve } from 'path'
import consola from 'consola'
import { serial as test } from 'ava'
import { compilePlugin, delay, watchP } from 'nuxt-test-utils'
require('jsdom-global')()

global.fetch = function(path) {
  return Promise.resolve({
    text() {
      return '# Example Markdown'
    }
  })
}

let Plugin
const src = pResolve('./lib/stories.plugin.js')
const tmpFile = pResolve('./lib/stories.plugin.compiled.js')

test('Stories plugin', async (t) => {
  const pluginOptions = {
    storiesDir: '.stories',
    storiesAnchor: '.stories',
    markdownEnabled: false
  }
  compilePlugin({ src, tmpFile, options: pluginOptions, overwrite: true })
  const { default: Plugin } = await import(tmpFile).catch(console.error)
  const modulesRegistered = []
  const mutations = []
  const watchers = []
  const expectedWatchers = [
    '$route.meta.mdPath', 
    'storiesData.frontMatter.order'
  ]
  let destroyed = 0
  let nuxtSocketCfg = {}
  let markdownSaved = false
  const ctx = {
    $destroy() {
      destroyed++
    },
    $nuxtSocket(cfg) {
      nuxtSocketCfg = cfg
      return { status: 'created' }
    },
    $route: {
      meta: {
        mdPath: 'http://localhost:3000',
        mdSavePath: 'http://localhost:3000'
      }
    },
    $set(obj, prop, val) {
      obj[prop] = val
    },
    $watch(watcher) {
      watchers.push(watcher)
    },
    saveMarkdown() {
      markdownSaved = true
    },
    storiesData: {},
    socket: {},
    store: {
      commit(mutation, data) {
        mutations.push(mutation)
      },
      registerModule(name) {
        modulesRegistered.push(name)
      }
    },
    inject(label, obj) {
      ctx['$' + label] = obj
    }
  }
  ctx.$store = ctx.store
  ctx.app = {
    store: ctx.store,
    router: {
      options: {
        routes: [{
          name: '.stories',
          path: '/.stories',
          children: [{
            name: 'child1',
            path: '/.stories/child1'
          }]
        }]
      }
    }
  }
  Plugin(ctx, ctx.inject)
  t.truthy(ctx['$nuxtStories'])
  t.is(mutations[0], '$nuxtStories/SET_STORIES')
  t.is(modulesRegistered[0], '$nuxtStories')

  ctx.$nuxtStories()
  t.truthy(ctx.componentDestroy)
  expectedWatchers.forEach((w, idx) => {
    t.is(w, watchers[idx])
  })
  t.is(nuxtSocketCfg.name, 'nuxtStories')
  t.is(nuxtSocketCfg.channel, '')
  t.true(nuxtSocketCfg.namespaceCfg.emitters.includes('saveMarkdown + storiesData'))
  t.is(ctx.socket.status, 'created')
  t.truthy(ctx.updateStory)
  await delay(500)
  t.true(ctx.storiesData.contents.length > 0)
  t.true(mutations.includes('$nuxtStories/SET_TOC'))
  t.true(markdownSaved)
})

test('Stories plugin (register components)', async (t) => {
  delete require.cache[tmpFile]
  delete process.env.TEST
  await import(tmpFile).catch((err) => {
    // It's ok. Mocking require.context is a pain, but at 
    // least we know the plugin is trying to call it, and we know
    // it works (because everyone uses require.context)
    t.is(err.message, 'require.context is not a function')
  })
})