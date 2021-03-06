import { serial as test } from 'ava'
import { state as nuxtStories, mutations, actions } from '@/lib/store/nuxtStories'
import Vue from 'vue'

const state = nuxtStories()
const stories = [{
  name: 'story1',
  path: 'stories/en/story1'
}, {
  name: 'story2',
  children: [{
    name: 'child1'
  }, {
    name: 'child2',
    frontMatter: {
      order: 33
    }
  }, {
    name: 'child3',
    frontMatter: {
      order: 37
    }
  }]
}]

test('State: Initialization', (t) => {
  t.true(Array.isArray(state.stories))
  t.true(Array.isArray(state.toc))
  const viewModesExp = ['view', 'edit', 'split']
  viewModesExp.forEach((mode, idx) => {
    t.is(mode, state.viewModes[idx])
  })
  t.true(state.viewMode === 'view')
})

test('Mutation: ADD_STORY', (t) => {
  // idxs always search one level up...
  const story = {
    name: 'newName',
    path: '/stories/en/newName'
  }
  mutations.SET_STORIES(state, stories)
  mutations.ADD_STORY(state, { story })
  mutations.ADD_STORY(state, { story, idxs: [0] })
  mutations.ADD_STORY(state, { story, idxs: [1] })
  const lastStory = state.stories[state.stories.length - 1]
  const lastStory0 = state.stories[0]
    .children[state.stories[0].children.length - 1]
  const lastStory1 = state.stories[1]
    .children[state.stories[1].children.length - 1]
  t.is(lastStory.name, story.name)
  t.is(lastStory.path, story.path)
  t.is(lastStory0.name, story.name)
  t.is(lastStory0.path, story.path)
  t.is(lastStory1.name, story.name)
  t.is(lastStory1.path, story.path)
})

test('Mutation: REMOVE_STORY', (t) => {
  mutations.SET_STORIES(state, stories)
  const child2 = state.stories[1].children[1]
  const lastStory = state.stories[1]
  mutations.REMOVE_STORY(state, {
    idxs: [1, 1]
  })
  t.not(state.stories[1].children[1].name, child2.name)
  mutations.REMOVE_STORY(state, {
    idxs: [1]
  })
  t.falsy(state.stories[1])
  mutations.REMOVE_STORY(state, {
    idxs: [55]
  })
})

test('Mutation: SET_STORIES', (t) => {
  mutations.SET_STORIES(state, stories)
  function testStory (s, idx) {
    t.is(s.name, state.stories[idx].name)
    if (s.children) {
      t.is(s.children.length, state.stories[idx].children.length)
    }
  }
  stories.forEach(testStory)
})

test('Mutation: SET_TOC', (t) => {
  const toc = [{
    heading: 'main',
    depth: 1
  }, {
    heading: 'sub-heading',
    depth: 2
  }]
  mutations.SET_TOC(state, toc)
  toc.forEach((item, idx) => {
    t.is(item.heading, state.toc[idx].heading)
    t.is(item.depth, state.toc[idx].depth)
  })
})

test('Mutation: SET_VIEW_MODE', (t) => {
  state.viewModes.forEach((v) => {
    mutations.SET_VIEW_MODE(state, v)
    t.is(state.viewMode, v)
  })

  mutations.SET_VIEW_MODE(state, 'badMode')
  t.is(state.viewMode, 'view')
})

test('Mutation: SET_ACTIVE_STORY', (t) => {
  const state1 = {
    stories: [{
      name: 'story1',
      path: '/stories/en/story1',
      children: [{
        name: 'child1',
        path: '/stories/en/story1/child1'
      }]
    }]
  }
  const fnd = mutations.SET_ACTIVE_STORY(state1, '/stories/en/story1/child1')
  t.is(fnd.path, '/stories/en/story1/child1')

  const fnd2 = mutations.SET_ACTIVE_STORY(state1, '/stories/en/story1')
  t.is(fnd2.path, '/stories/en/story1')

  const fnd3 = mutations.SET_ACTIVE_STORY(state1, '/stories/en/story1/nonExist/child1')
  t.falsy(fnd3)
})

test('Mutation: SET_STORY_ORDER', (t) => {
  mutations.SET_STORIES(state, [])
  mutations.SET_STORY_ORDER(state, {
    idxs: [1],
    order: 22
  })

  t.is(state.stories.length, 0)

  mutations.SET_STORIES(state, stories)
  mutations.SET_STORY_ORDER(state, {
    idxs: [1],
    order: 22
  })
  mutations.SET_STORY_ORDER(state, {
    idxs: [1, 1],
    order: 44
  })

  mutations.SET_STORY_ORDER(state, {
    idxs: [55, 35, 45],
    order: 11
  })

  t.is(state.stories[1].frontMatter.order, 22)
  t.is(state.stories[1].children[1].frontMatter.order, 44)
})

test('Mutation: SET_STORY_DATA', (t) => {
  const props = ['hovered', 'rename', 'remove']
  let data = props.reduce((out, prop) => {
    out[prop] = true
    return out
  }, {})
  mutations.SET_STORIES(state, stories)
  mutations.SET_STORY_DATA(state, {
    idxs: [0],
    data
  })
  mutations.SET_STORY_DATA(state, {
    idxs: [55],
    data: {
      rename: false
    }
  })
  props.forEach((prop) => {
    t.true(state.stories[0][prop])
  })
  t.is(state.stories[0].to, '')

  data = props.reduce((out, prop) => {
    out[prop] = false
    return out
  }, {})
  mutations.SET_STORY_DATA(state, {
    idxs: [0],
    data
  })

  props.forEach((prop) => {
    t.false(state.stories[0][prop])
  })
  t.is(state.stories[0].to, state.stories[0].path)
})

test('Mutation: RENAME_STORY', (t) => {
  const stories = [{
    name: 'story1',
    path: 'stories/en/story1'
  }, {
    name: 'story2',
    children: [{
      name: 'child1'
    }, {
      name: 'child2',
      frontMatter: {
        order: 33
      }
    }, {
      name: 'child3',
      frontMatter: {
        order: 37
      }
    }]
  }]
  mutations.SET_STORIES(state, stories)
  const name = 'newName'
  const path = '/stories/en/newName'
  mutations.RENAME_STORY(state, {
    idxs: [0],
    name,
    path
  })
  t.is(state.stories[0].name, name)
  t.is(state.stories[0].path, path)

  mutations.RENAME_STORY(state, {
    idxs: [55],
    name,
    path
  })
  t.falsy(state.stories[55])
})

test('Mutation: SET_FETCHED', (t) => {
  const state = {
    fetched: {},
    activeStory: {}
  }
  mutations.SET_FETCHED(state, {
    path: 'stories/en/Fetch',
    key: 'someJson',
    resp: { msg: 'some data' }
  })
  mutations.SET_FETCHED(state, {
    path: 'stories/en/Fetch2',
    resp: { msg: 'some more data' }
  })
  t.is(state.fetched['stories/en/Fetch'].someJson.msg, 'some data')
  t.is(state.fetched['stories/en/Fetch2'].msg, 'some more data')

  const frontMatter = { fetch: { abc: '/somePath' } }
  mutations.UPDATE_FRONTMATTER(state, frontMatter)
  mutations.SET_FETCHED(state, {
    path: 'stories/en/Fetch',
    key: 'abc',
    resp: { msg: 'some more data' }
  })
  t.is(state.fetched['stories/en/Fetch'].abc.msg, 'some more data')
  t.falsy(state.fetched['stories/en/Fetch'].someJson)

  mutations.UPDATE_FRONTMATTER(state, {})
  mutations.SET_FETCHED(state, {
    path: 'stories/en/Fetch',
    key: 'abc',
    resp: { msg: 'some more data' }
  })
  t.is(Object.keys(state.fetched['stories/en/Fetch']).length, 0)
})

test('Mutation: SET_LANG', (t) => {
  const newLang = 'es'
  mutations.SET_LANG(state, newLang)
  t.is(state.lang, newLang)

  mutations.SET_LANG(state, 'en')
})

test('Mutation: SET_STORIES_DIR', (t) => {
  const newDir = 'storiesX'
  mutations.SET_STORIES_DIR(state, newDir)
  t.is(state.storiesDir, newDir)

  mutations.SET_LANG(state, 'stories')
})

test('Action: ADD', (t) => {
  let _cfg
  const emitted = {
    'addStory': []
  }
  global.window = {
    $nuxt: {
      $nuxtSocket (cfg) {
        _cfg = cfg
        return {
          emit (evt, msg) {
            emitted[evt].push(msg)
          }
        }
      }
    }
  }

  const store = {
    state: {
      stories: [{
        name: 'Existing Story'
      }],
      lang: 'en',
      storiesDir: 'stories'
    },
    commit (label, data) {
      mutations[label](store.state, data)
    }
  }
  actions.ADD(store)
  const { persist, channel } = _cfg
  t.is(persist, 'storiesSocket')
  t.is(channel, '')
  t.is(emitted.addStory.length, 1)
  t.is(emitted.addStory[0].name, 'NewStory0')
  t.is(emitted.addStory[0].path, '/stories/en/NewStory0')
  t.is(emitted.addStory[0].idxs[0], 1)
  t.is(emitted.addStory[0].mdPath, 'stories/en/NewStory0.md')
  t.is(emitted.addStory[0].children.length, 0)
  t.false(emitted.addStory[0].hovered)
  t.false(emitted.addStory[0].rename)
  t.false(emitted.addStory[0].remove)

  const lastStory = store.state.stories[store.state.stories.length - 1]
  t.is(lastStory.name, 'NewStory0')
  t.is(lastStory.idxs[0], 1)

  actions.ADD(store, lastStory)
  actions.ADD(store, lastStory)
  const childStory = store.state.stories[1].children[store.state.stories[1].children.length - 2]
  const childStory2 = store.state.stories[1].children[store.state.stories[1].children.length - 1]
  t.is(childStory.name, 'NewStory0')
  t.is(childStory.idxs[0], 1)
  t.is(childStory.idxs[1], 0)

  t.is(childStory2.name, 'NewStory1')
  t.is(childStory2.idxs[0], 1)
  t.is(childStory2.idxs[1], 1)
})

test('Action: RENAME', (t) => {
  let _cfg
  const _routes = []
  const emitted = {
    'renameStory': []
  }
  global.window = {
    $nuxt: {
      $router: {
        push (route) {
          _routes.push(route)
        }
      },
      $nuxtSocket (cfg) {
        _cfg = cfg
        return {
          emit (evt, msg) {
            emitted[evt].push(msg)
          }
        }
      }
    }
  }

  const store = {
    state: {
      stories: [{
        name: 'Existing Story',
        path: '/stories/en/ExistingStory',
        mdPath: 'stories/en/ExistingStory.md',
        idxs: [0],
        children: [{
          name: 'Some child',
          path: '/stories/en/ExistingStory/somechild1',
          mdPath: 'stories/en/ExistingStory/somechild1.md',
          idxs: [0, 0]
        }]
      }],
      lang: 'en',
      storiesDir: 'stories'
    },
    commit (label, data) {
      mutations[label](store.state, data)
    }
  }
  const story = store.state.stories[0]
  const child = story.children[0]
  mutations.SET_STORY_DATA(store.state, {
    idxs: story.idxs,
    data: { hovered: true, remove: true }
  })
  actions.RENAME(store, {
    story,
    newName: 'NewName'
  })

  mutations.SET_STORY_DATA(store.state, {
    idxs: child.idxs,
    data: { hovered: true, remove: true }
  })
  actions.RENAME(store, {
    story: child,
    newName: 'NewName'
  })

  const { persist, channel } = _cfg
  t.is(persist, 'storiesSocket')
  t.is(channel, '')
  t.is(emitted.renameStory[0].oldPath, 'stories/en/ExistingStory.md')
  t.is(emitted.renameStory[0].newPath, 'stories/en/NewName.md')
  t.is(emitted.renameStory[1].oldPath, 'stories/en/NewName/somechild1.md')
  t.is(emitted.renameStory[1].newPath, 'stories/en/NewName/NewName.md')
  t.is(store.state.stories[0].path, '/stories/en/NewName')
  t.is(store.state.stories[0].mdPath, 'stories/en/NewName.md')
  t.is(store.state.stories[0].children[0].path, '/stories/en/NewName/NewName')
  t.is(store.state.stories[0].children[0].mdPath, 'stories/en/NewName/NewName.md')

  t.false(store.state.stories[0].rename)
  t.false(store.state.stories[0].children[0].rename)
  t.is(_routes[0], '/stories/en/NewName')
  t.is(_routes[1], '/stories/en/NewName/NewName')
})

test('Action: REMOVE', (t) => {
  let _cfg
  const _routes = []
  const emitted = {
    'removeStory': []
  }
  global.window = {
    $nuxt: {
      $router: {
        push (route) {
          _routes.push(route)
        }
      },
      $nuxtSocket (cfg) {
        _cfg = cfg
        return {
          emit (evt, msg) {
            emitted[evt].push(msg)
          }
        }
      }
    }
  }

  const store = {
    state: {
      stories: [{
        name: 'Existing Story',
        path: '/stories/en/ExistingStory', // go to "/stories" after removing
        mdPath: 'stories/en/ExistingStory.md',
        idxs: [0],
        children: [{
          name: 'child1',
          path: '/stories/en/ExistingStory/child1', // go to "/stories/en/ExistingStory" after removing
          mdPath: 'stories/en/ExistingStory/child1.md',
          idxs: [0, 0]
        }]
      }],
      lang: 'en',
      storiesDir: 'stories'
    },
    commit (label, data) {
      mutations[label](store.state, data)
    }
  }
  const story = store.state.stories[0]
  actions.REMOVE(store, story.children[0])
  actions.REMOVE(store, story)
  const { persist, channel } = _cfg
  t.is(persist, 'storiesSocket')
  t.is(channel, '')
  t.is(emitted.removeStory[0].path, 'stories/en/ExistingStory/child1.md')
  t.is(store.state.stories.length, 0)

  t.is(_routes[0], '/stories/en/ExistingStory')
  t.is(_routes[1], '/stories')
})

test('Action: FETCH', async (t) => {
  const _listeners = { fmFetched: [] }
  const emitted = {
    'fmFetch': []
  }
  const store = {
    state: {
      activeStory: {},
      fetched: {}
    },
    commit (label, data) {
      mutations[label](store.state, data)
    }
  }
  const _path = 'stories/en/Fetch'
  global.window = {
    localStorage: {
      setItem (item) {
        t.is(item, 'fetched')
      }
    },
    $nuxt: {
      $nuxtSocket (cfg) {
        return {
          listeners (evt) {
            t.is(evt, 'fmFetched')
            return {
              length: _listeners[evt].length
            }
          },
          on (evt, cb) {
            t.is(evt, 'fmFetched')
            _listeners[evt].push(cb)
          },
          emit (evt, msg, cb) {
            emitted[evt].push(msg)
            cb()
          }
        }
      }
    }
  }

  await actions.FETCH(store, {
    fetchInfo: {
      someCsv: '/someFile.csv'
    },
    path: _path
  })
  _listeners.fmFetched[0]({
    path: _path,
    key: 'someCsv',
    resp: 'results,here,1'
  })
  await actions.FETCH(store, {
    fetchInfo: {
      someCsv2: '/someFile2.csv'
    },
    path: _path
  })
  _listeners.fmFetched[0]({
    path: _path,
    key: 'someCsv2',
    resp: 'results,here,2',
    dest: 'localStorage'
  })
  t.is(_listeners.fmFetched.length, 1)
  t.is(emitted.fmFetch.length, 2)
  t.is(store.state.fetched[_path].someCsv, 'results,here,1')
  t.is(store.state.fetched[_path].someCsv2, 'results,here,2')
})

test('Action: FETCH_ESMS (and ESMS_FETCHED)', async (t) => {
  const dom = {}; const callCnt = { createElement: 0 }
  const mods1 = {
    named1: 111,
    n2: 333,
    Example3: 444
  }
  const mods2 = {
    named1: 111,
    n3: 'abc123',
    Example3: {
      render (h) {
        return h('div')
      }
    }
  }
  global.document = {
    createElement (tagName) {
      callCnt.createElement++
      t.is(tagName, 'script')
      return {
        replaceWith (newMod) {
          dom[newMod.id] = newMod
          newMod.modsImported(mods2)
        }
      }
    },
    getElementById (id) {
      return dom[id]
    },
    head: {
      appendChild (module) {
        dom[module.id] = module
        module.modsImported(mods1)
      }
    }
  }
  const store = {
    state: {
      esmsFetched: {}
    },
    commit (label, data) {
      mutations[label](store.state, data)
    }
  }
  const items = [
    { 'named1, named2 as n2': '/Example2.mjs' },
    '/Example3.mjs'
  ]
  const modId = `nuxt-stories-esm`

  await actions.FETCH_ESMS(store, { items })
  t.is(callCnt.createElement, 1)
  t.is(dom[modId].id, modId)
  t.is(dom[modId].type, 'module')
  t.is(
    dom[modId].text,
    'import { named1, named2 as n2 } from "/Example2.mjs"\n' +
    'import * as Example3 from "/Example3.mjs"\n' +
    "window.$nuxt.$store.commit('$nuxtStories/ESMS_FETCHED', { mods: { named1, n2, Example3 }})\n" +
    `const elm = document.getElementById('${modId}')\n` +
    `elm.modsImported({named1, n2, Example3})\n`
  )

  mutations.ESMS_FETCHED(store.state, { mods: mods1 })
  Object.entries(mods1).forEach(([alias, val]) => {
    t.true(store.state.esmsFetched[alias])
    t.is(Vue.prototype[alias], val)
  })

  await actions.FETCH_ESMS(store, { items })
  t.is(callCnt.createElement, 1)

  items[0] = { 'named1, named2 as n3': '/Example2.mjs' }
  await actions.FETCH_ESMS(store, { items })
  t.is(dom[modId].id, modId)
  t.is(dom[modId].type, 'module')
  t.is(
    dom[modId].text,
    'import { named1, named2 as n3 } from "/Example2.mjs"\n' +
    'import * as Example3 from "/Example3.mjs"\n' +
    "window.$nuxt.$store.commit('$nuxtStories/ESMS_FETCHED', { mods: { named1, n3, Example3 }})\n" +
    `const elm = document.getElementById('${modId}')\n` +
    `elm.modsImported({named1, n3, Example3})\n`
  )

  mutations.ESMS_FETCHED(store.state, { mods: mods2 })
  Object.entries(mods2).forEach(([alias, val]) => {
    t.true(store.state.esmsFetched[alias])
    t.is(Vue.prototype[alias], val)
  })
})

test('Action: FETCH_NPMS', async (t) => {
  const jsons = {
    'https://data.jsdelivr.com/v1/package/npm/lodash-es': {
      'tags': {
        'latest': '4.17.20'
      }
    },
    'https://data.jsdelivr.com/v1/package/npm/lodash-es@4.17.20': {
      default: '/index.min.js'
    },
    'https://data.jsdelivr.com/v1/package/npm/lodash-es@4.17.13': {
      default: '/index.min.js'
    }
  }

  global.fetch = function (path) {
    return Promise.resolve({
      json () {
        return jsons[path]
      }
    })
  }
  const path = '/some/path'
  const items = [
    'lodash-es',
    { 'filter': 'lodash-es@4.17.13' }
  ]

  const esms = await actions.FETCH_NPMS(null, { items, path })
  t.is(esms[0], 'https://cdn.jsdelivr.net/npm/lodash-es@4.17.20/index.min.js')
  t.is(esms[1].filter, 'https://cdn.jsdelivr.net/npm/lodash-es@4.17.13/index.min.js')
})

test('Action: FETCH_SCRIPTS', async (t) => {
  const callCnt = { createElement: 0, appendChild: 0 }
  const aliases = [
    { alias: 'script1', url: '/url/to/script1.js' },
    { alias: 'someAlias', url: '/url/to/script2.js' }
  ]
  global.window = {}
  global.document = {
    createElement (tagName) {
      t.is(tagName, 'script')
      callCnt.createElement++
      return {}
    },
    head: {
      appendChild (script) {
        const idx = callCnt.appendChild
        const { alias, url } = aliases[idx]
        t.is(script.id, `nuxt-stories-script-${alias}`)
        t.is(script.src, url)
        window[alias] = {}
        script.onload()
        callCnt.appendChild++
      }
    }
  }

  const items = [
    '/url/to/script1.js',
    { someAlias: '/url/to/script2.js' }
  ]

  await actions.FETCH_SCRIPTS(null, { items })
  t.is(callCnt.createElement, items.length)
  t.is(callCnt.appendChild, items.length)
  aliases.forEach(({ alias }) => {
    t.truthy(Vue.prototype[alias])
  })

  await actions.FETCH_SCRIPTS(null, { items })
  t.is(callCnt.appendChild, items.length)
})

test('Action: FETCH_COMPONENTS', async (t) => {
  const items = [
    '/Example33.vue',
    { E: '/Example4.js' },
    '/JustJS.js'
  ]
  const origin = 'https://localhost:3000'
  global.window = {
    $nuxt: {
      $nuxtSocket (cfg) {
        t.is(cfg.persist, 'storiesSocket')
        t.is(cfg.channel, '')
        return {
          emit (evt, msg, cb) {
            t.is(evt, 'fetchComponents')
            t.is(msg.components[0][0], 'Example33')
            t.is(msg.components[0][1], '/Example33.vue')
            t.is(msg.components[1][0], 'E')
            t.is(msg.components[1][1], '/Example4.js')
            t.is(msg.origin, origin)
            cb()
          }
        }
      }
    }
  }

  await actions.FETCH_COMPONENTS(null, {
    items,
    origin
  })

  t.falsy(Vue.component('Example33'))
  t.falsy(Vue.component('E'))

  Vue.component('Example33', {
    render (h) {
      return h('p', 'example33')
    }
  })

  Vue.component('E', {
    render (h) {
      return h('p', 'example4 (E)')
    }
  })

  Vue.component('JustJS', {
    fn1 () {
      return 'renderless'
    }
  })

  const imported = await actions.FETCH_COMPONENTS(null, {
    items,
    origin
  })
  t.is(imported.Example33.name, 'Example33')
  t.is(imported.E.name, 'E')
})
