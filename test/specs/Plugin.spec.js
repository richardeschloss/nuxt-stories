/* eslint-disable no-unused-vars */
/* eslint-disable node/no-callback-literal */
import { readFileSync } from 'fs'
import ava from 'ava'
import { pluginCtx, pluginDef } from '../utils/plugin.js'
import { nuxtStories as $nuxtStories } from '#root/lib/plugin.js'

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
      public: {
        nuxtStories: {
          storiesAnchor: 'stories',
          storiesDir: 'stories',
          lang: 'en'
        }
      }
    },
    $nuxtStories
  })
  await pluginDef(ctx)
  const ctx2 = pluginCtx()

  t.truthy(ctx2.vueApp.config.errorHandler)
  t.truthy(ctx2.vueApp.config.warnHandler)
  t.truthy(ctx2.vueApp.components.Json)
  t.truthy(ctx2.$nuxtStories)

  ctx2.vueApp.config.errorHandler(new Error('something')) // debug print only
  ctx2.vueApp.config.errorHandler(new Error('render'), null, 'render')
  t.is(ctx2.$nuxtStories().value.compilationError, 'render')

  ctx2.vueApp.config.warnHandler('something') // console.warn only
  ctx2.vueApp.config.warnHandler('something', null, 'VueJsonPretty')
  ctx2.vueApp.config.warnHandler('Template compilation error')
  t.is(ctx2.$nuxtStories().value.compilationError, 'Template compilation error')
  ctx2.vueApp.config.warnHandler('not defined on instance')
  t.is(ctx2.$nuxtStories().value.compilationError, 'not defined on instance')
  ctx2.vueApp.config.warnHandler('Vue received a Component which was made a reactive object')
  t.falsy(ctx2.$nuxtStories().value.compilationError)
})

test('Plugin (static host)', async (t) => {
  process.client = true
  const ctx = pluginCtx()
  Object.assign(ctx.vueApp.$nuxt, {
    $config: {
      public: {
        nuxtStories: {
          staticHost: true,
          storiesAnchor: 'stories',
          storiesDir: 'stories',
          lang: 'en'
        }
      }
    }
  })
  await pluginDef(ctx)
  const ctx2 = pluginCtx()

  t.truthy(ctx2.vueApp.$nuxt.$config.public.nuxtStories.db)
  t.is(fetched, '/nuxtStories/stories.db')

  const state = ctx2.$nuxtStories().value
  t.truthy(state.stories)
  process.client = false
})
