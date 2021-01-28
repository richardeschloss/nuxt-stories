import { serial as test } from 'ava'
import VueDist from 'vue/dist/vue.common.js'
import StoryFactory from '@/lib/utils/storyFactory'
require('jsdom-global')()

function initStores () {
  global.localStorage = {
    fetched: {
      '/some/path': {
        someJson: { msg: 'Hi' }
      }
    }
  }

  global.sessionStorage = {
    fetched: {
      '/some/path2': {
        someJson2: { msg: 'Hi again' }
      }
    }
  }
}

const currentRoute = {
  path: '/some/path'
}
const res = VueDist.compile(`<div>Story</div>`)
const stores = ['localStorage', 'sessionStorage']
const _dispatched = []
const vuexStore = {
  state: {
    $nuxtStories: {
      fetched: {
        '/some/path': {
          someJson: { msg: 'Hi' }
        }
      }
    }
  },
  dispatch (action, msg) {
    _dispatched.push({ action, msg })
  }
}

test('Defaults (stores undef)', (t) => {
  const compiled = StoryFactory({ ...res })
  const vm = new VueDist(compiled)
  vm.$store = {}
  vm.$mount()
  stores.forEach((store) => {
    t.is(JSON.stringify(vm[store]), '{}')
  })
  t.is(JSON.stringify(vm.fetched), '{}')
})

test('Defaults (stores defined)', (t) => {
  initStores()
  const compiled = StoryFactory({ ...res })
  const vm = new VueDist(compiled)
  vm.$route = currentRoute
  vm.$store = vuexStore
  vm.$fetch = compiled.fetch
  vm.$mount()
  stores.forEach((store) => {
    t.is(JSON.stringify(vm[store]), JSON.stringify(global[store]))
  })
  t.is(JSON.stringify(vm.fetched), JSON.stringify(vuexStore.state.$nuxtStories.fetched[currentRoute.path]))
  vm.$fetch()
  t.is(_dispatched.length, 0)
})

test('Defaults (fetch enabled, frontMatter undefined)', (t) => {
  const cfg = { fetch: true }
  const compiled = StoryFactory({ cfg, ...res })
  const vm = new VueDist(compiled)
  vm.$route = currentRoute
  vm.$store = vuexStore
  vm.$fetch = compiled.fetch
  vm.$mount()
  vm.$fetch()
  t.is(_dispatched.length, 0)
})

test('Defaults (fetch enabled, frontMatter defined)', (t) => {
  const frontMatter = {
    fetch: {
      someJson: '/path/to/json1'
    },
    nodeFetch: {
      someJson2: '/path/to/json2'
    }
  }
  const cfg = { fetch: true }
  const compiled = StoryFactory({ cfg, frontMatter, ...res })
  const vm = new VueDist(compiled)
  vm.$route = currentRoute
  vm.$store = vuexStore
  vm.$fetch = compiled.fetch
  vm.$mount()
  vm.$fetch()
  t.is(_dispatched[0].action, '$nuxtStories/FETCH')
  t.is(_dispatched[0].msg.fetchInfo.someJson2, frontMatter.nodeFetch.someJson2)
})
