import ava from 'ava'
import { pluginCtx, pluginDef } from '../utils/plugin.js'
// @ts-ignore
import Plugin from '#root/lib/plugin.js'

const { serial: test } = ava

test('Plugin (dynamic host)', async (t) => {
  const ctx = pluginCtx()
  Object.assign(ctx, {
    $config: {
      nuxtStories: {
        storiesDir: 'stories',
        lang: 'en'
      }
    }
  })
  ctx.nuxt2Context = {
    app: {
      router: {
        beforeEach () {}
      }
    },
    $config: ctx.$config,
    store: ctx.store
  }
  pluginDef(ctx)
  t.truthy(ctx.components.Json)
  const { $nuxtStories: state } = ctx.$store.state
  t.is(state.lang, 'en')
  t.is(state.storiesDir, 'stories')
})
