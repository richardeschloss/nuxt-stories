/* eslint-disable no-unused-vars */
/* eslint-disable node/no-callback-literal */
import { readFileSync } from 'fs'
import ava from 'ava'
import { pluginCtx, pluginDef } from '../utils/plugin.js'
import '#root/lib/plugin.js'

const { serial: test } = ava

let fetched
// eslint-disable-next-line require-await
global.fetch = async function (url) {
  fetched = url
  return {
    json () {
      const db = readFileSync('./stories/stories.db', { encoding: 'utf-8' })
      return JSON.parse(db)
    }
  }
}

test('Plugin (dynamic host)', async (t) => {
  const ctx = pluginCtx()
  Object.assign(ctx.vueApp.$nuxt, {
    $config: {
      nuxtStories: {
        storiesAnchor: 'stories',
        storiesDir: 'stories',
        lang: 'en'
      }
    }
  })
  await pluginDef(ctx)
  const ctx2 = pluginCtx()

  t.truthy(ctx2.vueApp.config.errorHandler)
  t.truthy(ctx2.vueApp.config.warnHandler)
  t.truthy(ctx2.vueApp.components.Json)
  t.truthy(ctx2.$nuxtStories)

  ctx2.vueApp.config.errorHandler(new Error('something'))
  ctx2.vueApp.config.warnHandler(new Error('something'))
  try {
    ctx2.vueApp.config.errorHandler(new Error('render'), null, 'render')
  } catch (err) {
    t.is(err.message, 'Error: render')
  }
  ctx2.vueApp.config.warnHandler(new Error('something'), null, 'VueJsonPretty')

  try {
    ctx2.vueApp.config.warnHandler(new Error('Error compiling template'))
  } catch (err) {
    t.is(err.message, 'Error: Error compiling template')
  }
})

test('Plugin (static host)', async (t) => {
  const ctx = pluginCtx()
  Object.assign(ctx.vueApp.$nuxt, {
    $config: {
      nuxtStories: {
        staticHost: true,
        storiesAnchor: 'stories',
        storiesDir: 'stories',
        lang: 'en'
      }
    }
  })
  await pluginDef(ctx)
  const ctx2 = pluginCtx()

  t.truthy(ctx2.vueApp.$nuxt.$config.nuxtStories.db)
  t.is(fetched, '/nuxtStories/stories.db')

  const state = ctx2.$nuxtStories().value
  t.truthy(state.stories)
})
