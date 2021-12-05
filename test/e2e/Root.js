// @ts-nocheck
import 'jsdom-global/register.js'
import { readFileSync } from 'fs'
import { resolve as pResolve } from 'path'
import ava from 'ava'
import Vue from 'vue/dist/vue.runtime.esm.js'
import Vuex from 'vuex'
import Root from '#root/lib/components/Root.js'
import { state, mutations } from '#root/lib/store/nuxtStories.js'
import { delay } from 'les-utils/utils/promise.js'

const { serial: test, beforeEach, after } = ava

const shallowRender = {
  render (h) {
    return h('div')
  }
}

Vue.use(Vuex)
let store
const components = {
  'NuxtStoriesHeader': shallowRender
}

const fetched = []
global.fetch = async function(url) {
  fetched.push(url)
  return {
    json() {
      return JSON.parse(readFileSync(pResolve('./stories/stories.db'), { encoding: 'utf-8' }))
    }
  }
}

beforeEach(() => {
  store = new Vuex.Store({
    state: {},
    modules: {
      $nuxtStories: {
        namespaced: true,
        state: state(),
        mutations
      }
    }
  })
})

test('Root (ssr enabled)', async (t) => {
  const p = []
  const Comp = Vue.extend(Root)
  const comp = new Comp({ components })
  const mocks = {
    $store: store,
    $config: {
      nuxtStories: {
        lang: 'en',
        staticHost: false
      }
    },
    $nuxtSocket(opts) {
      t.is(opts.name, 'nuxtStories')
      t.is(opts.channel, '')
      t.is(opts.namespaceCfg.emitters[0], 'fetchStories')
      return {
        async onceP(evt) {
          t.is(evt, 'connect')
          p.push(Promise.resolve())
        }
      }
    },
    async fetchStories(lang) {
      t.is(lang, 'en')
      return [{
        name: 'story1'
      }, {
        name: 'story2'
      }]  
    },
    $route: {
      path: '/stories/en/story1'
    }
  }
  Object.assign(comp, mocks)
  await comp.$mount()
  await Promise.all(p)
  t.truthy(comp.$el)
  t.truthy(comp.socket)
  const { stories } = comp.$store.state.$nuxtStories
  t.is(stories[0].name, 'story1')
  t.is(stories[1].name, 'story2')
})

test('Root (static host)', async (t) => {
  const Comp = Vue.extend(Root)
  const comp = new Comp({ components })
  const mocks = {
    $store: store,
    $config: {
      nuxtStories: {
        lang: 'en',
        staticHost: true
      }
    },
    $route: {
      path: '/stories/en/story1'
    }
  }
  Object.assign(comp, mocks)
  await comp.$mount()
  await delay(100)
  t.truthy(comp.$el)
  t.falsy(comp.socket)
  const { stories } = comp.$store.state.$nuxtStories
  t.true(stories.length > 0)
})

