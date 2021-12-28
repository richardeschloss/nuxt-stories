/* eslint-disable no-unused-vars */
/* eslint-disable node/no-callback-literal */
import { readFileSync } from 'fs'
import ava from 'ava'
import { pluginCtx, pluginDef } from '../utils/plugin.js'

// @ts-ignore
import Plugin from '#root/lib/plugin.js'

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

test('Plugin (dynamic host)', (t) => {
  const routes = []
  const ctx = pluginCtx()
  Object.assign(ctx, {
    nuxt2Context: {
      app: {
        router: {
          beforeEach (cb) {
            // _beforeEachCb = cb
            cb(
              {
                path: '/stories/en/',
                params: {}
              },
              null,
              () => {}
            )
            t.is(routes.length, 0)

            cb(
              {
                path: '/stories',
                params: {}
              },
              null,
              () => {}
            )
            t.is(routes[0], '/stories/en/')

            cb(
              {
                path: '/stories/en',
                params: {}
              },
              null,
              () => {}
            )
            t.is(routes[1], '/stories/en/')

            cb(
              {
                path: '/stories/',
                params: {}
              },
              null,
              () => {}
            )
            t.is(routes[2], '/stories/en/')
          },
          push (route) {
            routes.push(route)
          }
        }
      },
      $config: {
        nuxtStories: {
          storiesAnchor: 'stories',
          storiesDir: 'stories',
          lang: 'en'
        }
      },
      store: ctx.store
    }
  })

  pluginDef(ctx)
  t.truthy(ctx.components.Json)
  t.truthy(ctx.$store.state.$nuxtStories)
})

test('Plugin (static host)', async (t) => {
  const ctx = pluginCtx()
  Object.assign(ctx, {
    nuxt2Context: {
      app: {
        router: {
          beforeEach () {}
        }
      },
      $config: {
        nuxtStories: {
          staticHost: true,
          storiesAnchor: 'stories',
          storiesDir: 'stories',
          lang: 'en'
        }
      },
      store: ctx.store
    }
  })
  ctx.$config = ctx.nuxt2Context.$config

  await pluginDef(ctx)
  t.truthy(ctx.$config.nuxtStories.db)
  t.is(fetched, '/nuxtStories/stories.db')
})
