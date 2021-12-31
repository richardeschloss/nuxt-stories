import ava from 'ava'
import { state as nuxtStories, mutations, actions } from '#root/lib/store/nuxtStories.js'

const { serial: test } = ava

const store = {}

global.localStorage = {
  setItem (item, data) {
    store[item] = data
  }
}

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
  t.true(state.viewMode === '')
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
  t.is(store.nuxtStoriesViewMode, 'view')
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
  mutations.SET_ACTIVE_STORY(state, state1.stories[0])
  t.is(state.activeStory.name, 'story1')
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

  state.activeStory.frontMatter = { fetch: { abc: '/somePath' } }
  mutations.SET_FETCHED(state, {
    path: 'stories/en/Fetch',
    key: 'abc',
    resp: { msg: 'some more data' }
  })
  t.is(state.fetched['stories/en/Fetch'].abc.msg, 'some more data')
  t.falsy(state.fetched['stories/en/Fetch'].someJson)

  state.activeStory.frontMatter = {}
  mutations.SET_FETCHED(state, {
    path: 'stories/en/Fetch',
    key: 'abc',
    resp: { msg: 'some more data' }
  })
  t.is(Object.keys(state.fetched['stories/en/Fetch']).length, 0)
})

test('Action: FETCH_STORY', async (t) => {
  const emitted = {}
  global.fetch = async function (url) {
    t.is(url, '/nuxtStories/stories.db')
    return {
      json () {},
      text () {}
    }
  }
  global.window = {
    $nuxt: {
      $config: {
        nuxtStories: {}
      },
      $nuxtSocket (cfg) {
        return {
          async emitP (evt, msg) {
            emitted[evt] = msg
            return { name: 'example story' }
          }
        }
      }
    }
  }
  store.commit = (label, data) => {
    t.is(label, 'SET_ACTIVE_STORY')
    t.is(data.name, 'example story')
  }
  await actions.FETCH_STORY(store, '/stories/en/Fetch')

  window.$nuxt.$config.nuxtStories.staticHost = true
  try {
    await actions.FETCH_STORY(store, '/stories/en/Fetch')
  } catch (e) {

  }
})

test('Action: FETCH', async (t) => {
  const _listeners = { fmFetched: [] }
  const emitted = {
    fmFetch: []
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
