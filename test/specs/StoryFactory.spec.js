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
  vm.$route = currentRoute
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

test('Defaults (fetch enabled, dynamicImport disabled, frontMatter undefined)', (t) => {
  const cfg = { fetch: true, dynamicImport: false }
  const compiled = StoryFactory({ cfg, ...res })
  const vm = new VueDist(compiled)
  vm.$route = currentRoute
  vm.$store = vuexStore
  vm.$fetch = compiled.fetch
  vm.$fetch()
  t.is(_dispatched.length, 0)
})

test('Defaults (fetch enabled, dynamicImport enabled, frontMatter undefined)', (t) => {
  const cfg = { fetch: true, dynamicImport: true }
  const compiled = StoryFactory({ cfg, ...res })
  const vm = new VueDist(compiled)
  vm.$route = currentRoute
  vm.$store = vuexStore
  vm.$fetch = compiled.fetch
  vm.$fetch()
  t.is(_dispatched.length, 0)
})

test('Defaults (fetch enabled, frontMatter defined)', async (t) => {
  const frontMatter = {
    fetch: {
      someJson: '/path/to/json1'
    },
    nodeFetch: {
      someJson2: '/path/to/json2'
    }
  }
  const cfg = { fetch: true, dynamicImport: true }
  const compiled = StoryFactory({ cfg, frontMatter, ...res })
  const vm = new VueDist(compiled)
  vm.$route = currentRoute
  vm.$store = vuexStore
  vm.$fetch = compiled.fetch
  await vm.$fetch()
  t.is(_dispatched[0].action, '$nuxtStories/FETCH')
  t.is(_dispatched[0].msg.fetchInfo.someJson2, frontMatter.nodeFetch.someJson2)
})

test('Fetch NPMS and ESMS', async (t) => {
  const _dispatched = []
  const vuexStore2 = {
    state: {
      $nuxtStories: {}
    },
    dispatch (action, msg) {
      _dispatched.push({ action, msg })
      if (action === '$nuxtStories/FETCH_NPMS') {
        return ['/urlPath/to/lodash-es']
      }
    }
  }  
  const cfg = { fetch: true, dynamicImport: true }
  const frontMatter = {
    npm: [
      'lodash-es'
    ]
  }

  let compiled = StoryFactory({ cfg, frontMatter, ...res })
  let vm = new VueDist(compiled)
  vm.$route = currentRoute
  vm.$store = {
    state: {
      $nuxtStories: {}
    },
    dispatch (action, msg) {
      _dispatched.push({ action, msg })
      if (action === '$nuxtStories/FETCH_NPMS') {
        return ['/urlPath/to/lodash-es']
      }
    }
  }  
  vm.$fetch = compiled.fetch
  await vm.$fetch()
  t.is(_dispatched[0].action, '$nuxtStories/FETCH_NPMS')
  t.is(_dispatched[0].msg.items.length, frontMatter.npm.length)
  t.is(_dispatched[1].action, '$nuxtStories/FETCH_ESMS')
  t.is(_dispatched[1].msg.items.length, frontMatter.npm.length)

  frontMatter.esm = ['/Example2.mjs']
  compiled = StoryFactory({ cfg, frontMatter, ...res })
  vm = new VueDist(compiled)
  vm.$route = currentRoute
  vm.$store = {
    state: {
      $nuxtStories: {}
    },
    dispatch (action, msg) {
      _dispatched.push({ action, msg })
      if (action === '$nuxtStories/FETCH_NPMS') {
        return ['/urlPath/to/lodash-es']
      }
    }
  }  
  vm.$fetch = compiled.fetch
  await vm.$fetch()
  t.is(_dispatched[2].action, '$nuxtStories/FETCH_ESMS')
  t.is(_dispatched[2].msg.items.length, frontMatter.esm.length + frontMatter.npm.length)

  await vm.$fetch()
  t.is(_dispatched.length, 3)
  t.is(_dispatched[2].msg.items[0], '/Example2.mjs')
  t.is(_dispatched[2].msg.items[1], '/urlPath/to/lodash-es')
})

test('Fetch Script', async (t) => {
  const _dispatched = []
  const vuexStore2 = {
    state: {
      $nuxtStories: {}
    },
    dispatch (action, msg) {
      _dispatched.push({ action, msg })
    }
  }  
  const frontMatter = {
    script: [
      '/url/to/script.js'
    ]
  }
  const cfg = { fetch: true, dynamicImport: true }
  const compiled = StoryFactory({ cfg, frontMatter, ...res })
  let vm = new VueDist(compiled)
  vm.$route = currentRoute
  vuexStore2.state.$nuxtStories.esmsFetched = {}
  vm.$store = vuexStore2
  vm.$fetch = compiled.fetch
  await vm.$fetch()
  t.is(_dispatched[0].action, '$nuxtStories/FETCH_SCRIPTS')
  t.is(_dispatched[0].msg.items.length, frontMatter.script.length)
  
  vm.$fetch()
  t.is(_dispatched.length, 1)
})

test('Fetch Components', async (t) => {
  const _dispatched = []
  const vuexStore2 = {
    state: {
      $nuxtStories: {}
    },
    dispatch (action, msg) {
      _dispatched.push({ action, msg })
    }
  }  
  const frontMatter = {
    components: [
      '/url/to/component.vue'
    ]
  }
  const cfg = { fetch: true, dynamicImport: true }
  const compiled = StoryFactory({ cfg, frontMatter, ...res })
  let vm = new VueDist(compiled)
  vm.$route = currentRoute
  vuexStore2.state.$nuxtStories.esmsFetched = {}
  vm.$store = vuexStore2
  vm.$fetch = compiled.fetch
  await vm.$fetch()
  t.is(_dispatched[0].action, '$nuxtStories/FETCH_COMPONENTS')
  t.is(_dispatched[0].msg.items.length, frontMatter.components.length)
})