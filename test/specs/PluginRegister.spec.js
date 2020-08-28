/* eslint-disable require-await */
import { serial as test } from 'ava'
import { delay } from 'nuxt-test-utils'
import { register, methods, directives } from '@/lib/plugin.register'
require('jsdom-global')()

test('Register: components', (t) => {
  try {
    register.components()
  } catch (err) {
    t.is(err.message, 'require.context is not a function')
  }
})

test('Register: icons', (t) => {
  try {
    register.icons()
    t.pass()
  } catch (err) {
    t.fail()
  }
})

test('Register: static stories', async (t) => {
  register.options({
    staticHost: true
  })
  const committed = {}
  const store = {
    state: {
      $nuxtStories: {
        lang: 'en'
      }
    },
    commit (label, data) {
      committed[label] = data
    }
  }
  const _fetched = []
  global.fetch = async function (url) {
    _fetched.push(url)
    return {
      json () {
        return {
          en: {
            name: 'stories'
          }
        }
      }
    }
  }
  register.staticStories(store)
  await delay(100)
  t.is(_fetched[0], '/markdown/stories.json')
  t.truthy(committed['$nuxtStories/SET_STORIES'])
  t.is(committed['$nuxtStories/SET_STORIES'].name, 'stories')

  register.options({
    staticHost: {
      mount: '/something'
    }
  })
  register.staticStories(store)
  await delay(100)
  t.is(_fetched[1], '/something/stories.json')

  register.options({
    staticHost: {
      url: 'https://myhost.xyz/stories.json'
    }
  })
  register.staticStories(store)
  await delay(100)
  t.is(_fetched[2], 'https://myhost.xyz/stories.json')
})

test('Register: Story IO', (t) => {
  register.options({ staticHost: true })
  let _cfg
  const ctx = {
    $nuxtSocket (cfg) {
      _cfg = cfg
      return {}
    }
  }

  register.storyIO(ctx)
  t.falsy(ctx.socket)

  register.options({})
  register.storyIO(ctx)
  t.truthy(ctx.socket)
  t.is(_cfg.name, 'nuxtStories')
  t.is(_cfg.channel, '')
  t.false(_cfg.reconnection)
  t.is(_cfg.emitTimeout, 5000)
  t.is(_cfg.namespaceCfg.emitters[0], 'fetchStory')
  t.is(_cfg.namespaceCfg.emitters[1], 'saveMarkdown + storiesData')

  register.options({
    ioOpts: {
      reconnection: true,
      emitTimeout: 10000
    }
  })
  register.storyIO(ctx)
  t.truthy(ctx.socket)
  t.is(_cfg.name, 'nuxtStories')
  t.is(_cfg.channel, '')
  t.true(_cfg.reconnection)
  t.is(_cfg.emitTimeout, 10000)
  t.is(_cfg.namespaceCfg.emitters[0], 'fetchStory')
  t.is(_cfg.namespaceCfg.emitters[1], 'saveMarkdown + storiesData')
})

test('Register: Stories Anchor', (t) => {
  let _fetched
  global.fetch = async function (url) {
    _fetched = url
    return {
      json () {
        return { name: 'stories' }
      }
    }
  }
  register.options({
    staticHost: true
  })
  const ctx = {
    $nuxtSocket (cfg) {
      return {
        on (evt, data) {

        }
      }
    },
    $store: {
      state: {
        $nuxtStories: {}
      },
      commit (label, data) {
      }
    }
  }
  register.storiesAnchor(ctx)
  t.falsy(ctx.socket)
  t.is(_fetched, '/markdown/stories.json')

  register.options({})
  register.storiesAnchor(ctx)
  t.truthy(ctx.socket)
})

test('Register: storiesIO', async (t) => {
  register.options({
    lang: 'en',
    storiesDir: 'stories',
    storiesAnchor: 'stories'
  })

  const _committed = {}
  let _cfg
  const ctx = {
    async fetchStories (args) {
      return {
        stories: {
          name: 'stories'
        }
      }
    },
    $nuxtSocket (cfg) {
      _cfg = cfg
      return {
        on (evt, cb) {
          if (evt === 'connect') {
            cb()
          }
        }
      }
    },
    $store: {
      commit (label, data) {
        _committed['$nuxtStories/SET_STORIES'] = data
      }
    }
  }
  register.storiesIO(ctx)
  await delay(100)
  t.truthy(ctx.socket)
  t.is(_cfg.name, 'nuxtStories')
  t.is(_cfg.channel, '')
  t.false(_cfg.reconnection)
  t.is(_cfg.emitTimeout, 1000)
  t.is(_cfg.namespaceCfg.emitters[0], 'fetchStories')
  t.truthy(_committed['$nuxtStories/SET_STORIES'])

  register.options({
    lang: 'en',
    storiesDir: 'stories',
    storiesAnchor: 'stories',
    ioOpts: {
      reconnection: true,
      emitTimeout: 1111
    }
  })
  register.storiesIO(ctx)
  t.true(_cfg.reconnection)
  t.is(_cfg.emitTimeout, 1111)
})

test('Register: stories (no children)', (t) => {
  const routeRoot = 'stories'
  const router = {
    options: {
      routes: [{
        name: 'index'
      }, {
        name: 'stories'
      }]
    }
  }

  const store = {
    commit (label, stories) {
      t.is(label, '$nuxtStories/SET_STORIES')
    }
  }
  register.stories(store, router, routeRoot)

  t.pass()
})

test('Register: stories (children)', (t) => {
  const stories = [{
    name: 'index'
  }, {
    name: 'stories',
    children: [{
      name: 'story1'
    }, {
      name: 'story2',
      meta: {
        frontMatter: {
          order: 22
        }
      },
      children: [{
        name: 'story2Child'
      }]
    }]
  }]

  const store = {
    commit (label, stories) {
      t.is(label, '$nuxtStories/SET_STORIES')
    }
  }
  register.stories(store, stories)
})

test('Register: vuex module', (t) => {
  const store = {
    registerModule (label, options) {
      Object.assign(store, options)
      t.is(label, '$nuxtStories')
      t.true(options.namespaced)
    }
  }
  register.vuexModule(store)
})

test('Register: watchers', (t) => {
  const watchers = {}
  const called = {}
  const expectedWatchers = [
    '$route.path',
    'storiesData.frontMatter.order'
  ]
  const committed = []
  const ctx = {
    $store: {
      state: {
        $nuxtStories: {
          activeStory: {
            name: 'something',
            idxs: [0, 1]
          }
        }
      },
      commit (label, info) {
        committed.push({ label, info })
      }
    },
    $watch (label, cb) {
      watchers[label] = cb
    },
    updateStory () {
      called.updateStory = true
    }
  }
  register.watchers(ctx)
  expectedWatchers.forEach((w) => {
    t.truthy(watchers[w])
  })
  watchers['$route.path']()
  t.is(committed[0].label, '$nuxtStories/SET_ACTIVE_STORY')
  t.true(called.updateStory)

  watchers['storiesData.frontMatter.order'](false)
  t.falsy(committed[1])

  watchers['storiesData.frontMatter.order'](33)
  t.truthy(committed[1])
  t.is(committed[1].info.idxs[0], 0)
  t.is(committed[1].info.idxs[1], 1)
  t.is(committed[1].info.order, 33)
})

test('Methods: $destroy', (t) => {
  const state = {}
  const called = {}
  const ctx = {
    ...methods,
    $store: {
      commit (label, val) {
        state[label] = val
      }
    },
    componentDestroy () {
      called.componentDestroy = true
    }
  }
  ctx.$destroy()
  t.truthy(state['$nuxtStories/SET_TOC'])
  t.is(state['$nuxtStories/SET_TOC'].length, 0)
  t.true(called.componentDestroy)
})

test('Methods: Update Story (lang undef)', async (t) => {
  register.options({})
  const ctx = {
    ...methods,
    $route: {
      params: {}
    },
    storiesData: {}
  }
  await ctx.updateStory()
  t.falsy(ctx.storiesData.contents)
})

test('Methods: Update Story (dynamic host)', async (t) => {
  register.options({
    storiesDir: 'stories',
    lang: 'en'
  })

  const state = {}
  const called = {}
  const _fetched = []
  const ctx = {
    ...methods,
    async fetchStory ({ mdPath }) {
      _fetched.push(mdPath)
    },
    $route: {
      params: {
        lang: 'en'
      },
      path: 'stories/en/Examples'
    },
    $set (obj, prop, data) {
      obj[prop] = data
    },
    $store: {
      commit (label, data) {
        state[label] = data
      }
    },
    async saveMarkdown () {
      called.saveMarkdown = true
    },
    storiesData: {}
  }

  await ctx.updateStory()
  t.is(_fetched[0], 'stories/en/Examples.md')
  t.falsy(ctx.storiesData.compiled)

  ctx.fetchStory = async function ({ mdPath }) {
    _fetched.push(mdPath)
    return '# Hi how are you?'
  }

  await ctx.updateStory()
  t.is(_fetched[1], 'stories/en/Examples.md')
  t.truthy(ctx.storiesData.compiled)
  t.truthy(ctx.storiesData.frontMatter)
  t.truthy(state['$nuxtStories/SET_TOC'])
  t.true(called.saveMarkdown)
})

test('Methods: Update Story (static host)', async (t) => {
  register.options({
    storiesDir: 'stories',
    lang: 'en',
    staticHost: true
  })
  function validateToc (expected) {
    const tocKeys = Object.keys(expected[0])
    expected.forEach((entry, idx) => {
      tocKeys.forEach((key) => {
        t.is(state['$nuxtStories/SET_TOC'][idx][key], entry[key])
      })
    })
  }

  const state = {}
  const called = {}
  const ctx = {
    ...methods,
    $route: {
      params: {
        lang: 'en'
      },
      path: '/stories/en/Examples'
    },
    $set (obj, prop, data) {
      obj[prop] = data
    },
    $store: {
      commit (label, data) {
        state[label] = data
      }
    },
    saveMarkdown () {
      called.saveMarkdown = true
    },
    storiesData: {
      contents: '# Hi how are you?'
    }
  }

  await ctx.compileContents()
  t.truthy(ctx.storiesData.compiled)
  t.truthy(ctx.storiesData.frontMatter)
  t.truthy(state['$nuxtStories/SET_TOC'])
  t.falsy(called.saveMarkdown)

  const expectedToc = [{
    type: 'heading',
    depth: 1,
    text: 'Hi how are you?',
    href: '#hi-how-are-you'
  }]

  validateToc(expectedToc)

  ctx.storiesData.contents = '## Hi I changed'
  const expectedToc2 = [{
    type: 'heading',
    depth: 2,
    text: 'Hi I changed',
    href: '#hi-i-changed'
  }]
  await ctx.compileContents(0)
  await delay(100)
  t.truthy(ctx.storiesData.compiled.data())

  validateToc(expectedToc2)

  const _fetched = []
  global.fetch = async function (path) {
    _fetched.push(path)
    return {
      text () {
        return '# Some fetched markdown'
      }
    }
  }
  await ctx.updateStory()
  t.is(_fetched[0], '/markdown/en/Examples.md')
  t.is(ctx.storiesData.contents, '# Some fetched markdown')

  register.options({
    storiesDir: 'stories',
    lang: 'en',
    staticHost: {
      mount: '/somewhere'
    }
  })
  await ctx.updateStory()
  t.is(_fetched[1], '/somewhere/en/Examples.md')

  const el = {
    innerHTML: '# Some markdown in an element'
  }
  const vnode = {
    context: {}
  }
  ctx.compileInnerHTML(el, null, vnode)
  t.is(
    vnode.context.compiled.trim(),
    '<h1 id="some-markdown-in-an-element">Some markdown in an element</h1>'
  )
})

test('Directives', (t) => {
  t.truthy(directives.markdown)
})
