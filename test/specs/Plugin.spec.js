/* eslint-disable require-await */
/* eslint-disable no-console */
// import 'jsdom-global/register.js'
import Vue from 'vue/dist/vue.common.js'
import { resolve as pResolve } from 'path'
import ava from 'ava'
import Plugin from '#root/lib/plugin.js'
import { wrapPlugin } from '../utils/plugin.js'
// import { compilePlugin, delay } from 'nuxt-test-utils'

const { serial: test } = ava

// @ts-ignore
global.fetch = async function (path) {
  return {
    text () {
      return '# Example Markdown'
    }
  }
}

const src = pResolve('./lib/stories.plugin.js')
const tmpFile = pResolve('./lib/stories.plugin.compiled.js')

test.only('Plugin (default)', (t) => {
  const ctx = wrapPlugin(Plugin)
  Object.assign(ctx, {
    app: {
      store: ctx.$store
    },
    $config: {
      nuxtStories: {
        storiesDir: 'stories',
        lang: 'en'  
      }
    }
  })
  ctx.Plugin(ctx, ctx.inject)
  const { $nuxtStories: state } = ctx.$store.state
  t.is(state.lang, 'en')
  t.is(state.storiesDir, 'stories')
  t.truthy(ctx.$nuxtStories)
})

test.only('Error Handler', (t) => {
  const msg = 'trying to compile circular JSON $route'
  Vue.config.errorHandler(new Error('non-render error'))
  t.pass()
  try {
    Vue.config.errorHandler(new Error(msg), null, 'render')
  } catch (err) {
    t.is(err.message, 'Error: ' + msg)
  }
})

test.only('Warn Handler', (t) => {
  // json pretty viewer warns when data prop contains functions.
  Vue.config.warnHandler(null, {}, 'some warning')
  Vue.config.warnHandler(null, {}, 'VueJsonPretty...')
  t.pass()
})


/** Archive **/
test('Stories plugin', async (t) => {
  const pluginOptions = {
    storiesDir: '.stories',
    storiesAnchor: '.stories',
    markdownEnabled: false,
    lang: 'en'
  }
  compilePlugin({ src, tmpFile, options: pluginOptions, overwrite: true })
  const { default: Plugin } = await import(tmpFile).catch(console.error)
  const modulesRegistered = []
  const mutations = []
  const watchers = []
  const expectedWatchers = [
    '$route.path',
    'storiesData.frontMatter.order'
  ]
  let nuxtSocketCfg = {}
  let markdownSaved = false
  let destroyed = 0
  const ctx = {
    fetchStory ({ mdPath }) {
      return Promise.resolve('ok')
    },
    $destroy () {
      destroyed++
    },
    $nuxtSocket (cfg) {
      nuxtSocketCfg = cfg
      return {
        on (evt, msg) {

        }
      }
    },
    $route: {
      meta: {
        mdPath: 'http://localhost:3000',
        mdSavePath: 'http://localhost:3000'
      },
      params: {
        lang: pluginOptions.lang
      }
    },
    $set (obj, prop, val) {
      obj[prop] = val
    },
    $watch (watcher) {
      watchers.push(watcher)
    },
    async saveMarkdown () {
      markdownSaved = true
    },
    storiesData: {},
    socket: {},
    store: {
      commit (mutation, data) {
        mutations.push(mutation)
      },
      registerModule (name) {
        modulesRegistered.push(name)
      }
    },
    inject (label, obj) {
      ctx['$' + label] = obj
    }
  }
  ctx.$store = ctx.store
  ctx.app = {
    store: ctx.store
  }
  Plugin(ctx, ctx.inject)
  t.truthy(ctx.$nuxtStories)
  t.is(mutations[0], '$nuxtStories/SET_LANG')
  t.is(mutations[1], '$nuxtStories/SET_STORIES_DIR')
  t.is(modulesRegistered[0], '$nuxtStories')

  ctx.$nuxtStories()
  t.truthy(ctx.componentDestroy)
  expectedWatchers.forEach((w, idx) => {
    t.is(w, watchers[idx])
  })
  t.is(nuxtSocketCfg.name, 'nuxtStories')
  t.is(nuxtSocketCfg.channel, '')
  t.true(nuxtSocketCfg.namespaceCfg.emitters.includes('saveMarkdown + storiesData'))
  t.truthy(ctx.updateStory)
  await delay(500)
  t.is(ctx.storiesData.contents, 'ok')
  t.true(mutations.includes('$nuxtStories/SET_TOC'))
  t.true(markdownSaved)

  ctx.$nuxtStories.mountedAnchor(ctx)
  t.truthy(ctx.socket)

  ctx.componentDestroy()
  t.is(destroyed, 1)
})
