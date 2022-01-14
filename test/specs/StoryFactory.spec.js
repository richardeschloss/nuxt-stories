import 'jsdom-global/register.js'
import ava from 'ava'
import { compile, createApp, h } from 'vue'
import BrowserEnv from 'browser-env'
import StoryFactory, { LoadDeps } from '#root/lib/utils/storyFactory.js'
import { useState } from '#app'
BrowserEnv({})

const { serial: test } = ava

Object.defineProperty(global, 'localStorage', {
  value: {
    fetched: {
      '/some/path': {
        someJson: { msg: 'Hi' }
      }
    }
  }
})

Object.defineProperty(global, 'sessionStorage', {
  value: {
    fetched: {
      '/some/path2': {
        someJson2: { msg: 'Hi again' }
      }
    }
  }
})

const currentRoute = {
  path: '/some/path'
}
const render = compile('<div>Story</div>')

const app = document.createElement('div')
app.id = 'app'
document.body.appendChild(app)

test('StoryFactory (various opts)', (t) => {
  const vueApp = createApp({
    render () {
      return h('div', [
        h(StoryFactory({ render }), { ref: 'comp1' }),
        h(StoryFactory({
          render,
          fetched: {
            a: 111
          },
          imported: {
            E2: { methods: {} }
          },
          frontMatter: {
            title: 'Example'
          }
        }), { ref: 'comp2' })
      ])
    }
  }).mount('#app')
  const comp = vueApp.$refs.comp1
  t.truthy(comp.localStorage)
  t.truthy(comp.sessionStorage)

  const comp2 = vueApp.$refs.comp2
  t.truthy(comp2.a)
  t.truthy(comp2.E2)
  t.is(comp2.title, 'Example')
})

test('Load Deps (fetch, nodeFetch)', async (t) => {
  const $config = {
    nuxtStories: {}
  }
  const resp = await LoadDeps({
    ctx: { $config }
  })
  t.falsy(resp)
  $config.nuxtStories.fetch = true
  const resp2 = await LoadDeps({
    ctx: { $config }
  })
  t.is(Object.keys(resp2.fetched).length, 0)

  global.fetch = async () => {
    return {
      json () {
        return { abc: 123 }
      },
      text () {
        return 'json in text form'
      }
    }
  }

  const listeners = {
    fmFetched: []
  }
  const ctx = {
    $route: currentRoute,
    $nuxtSocket (opts) {
      return {
        on (evt, cb) {
          listeners[evt].push(cb)
          t.is(evt, 'fmFetched')
          // eslint-disable-next-line node/no-callback-literal
          cb({
            ctx,
            key: 'someJson2',
            resp: 'someJson2 response'
          })
        },
        // eslint-disable-next-line require-await
        async emitP (evt, msg) {
          return {
            someJson2: 'someJson2 response'
          }
        },
        listeners (evt) {
          return listeners[evt]
        }
      }
    },
    $nuxtStories: () => useState('$nuxtStories', () => ({
      fetched: {}
    })),
    $config
  }
  const resp3 = await LoadDeps({
    ctx,
    frontMatter: {
      fetch: {
        someJson: '/path/to/json1'
      },
      nodeFetch: {
        someJson2: '/path/to/json2'
      }
    }
  })
  t.is(resp3.fetched.someJson, 'json in text form')
  t.is(resp3.fetched.someJson2, 'someJson2 response')
  await LoadDeps({
    ctx,
    frontMatter: {
      fetch: {
        someJson: '/path/to/json1'
      },
      nodeFetch: {
        someJson2: '/path/to/json2'
      }
    }
  })
})

test('Stores undef', (t) => {
  delete global.localStorage
  const comp = StoryFactory({ render })
  t.is(JSON.stringify(comp.computed.localStorage()), '{}')
})
