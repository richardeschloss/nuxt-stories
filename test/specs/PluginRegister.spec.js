import test from 'ava'
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
      console.log('stories', stories)
    }
  }
  register.stories(store, router, routeRoot)

  t.pass()
})

test('Register: stories (children)', (t) => {
  const routeRoot = 'stories'
  const router = {
    options: {
      routes: [{
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
    }
  }

  const store = {
    commit (label, stories) {
      t.is(label, '$nuxtStories/SET_STORIES')
      router.options.routes[1].children.forEach((story, idx) => {
        t.is(story.name, stories[idx].name)
        if (story.meta) {
          t.truthy(stories[idx].frontMatter)
        }

        if (story.children) {
          story.children.forEach((c, cIdx) => {
            t.is(c.name, stories[idx].children[cIdx].name)
          })
        }
      })
    }
  }
  register.stories(store, router, routeRoot)

  t.pass()
})

test('Register: vuex module', (t) => {
  let _options
  const store = {
    registerModule (label, options) {
      Object.assign(store, options)
      t.is(label, '$nuxtStories')
      t.true(options.namespaced)
    }
  }
  register.vuexModule(store)
  const stories = [{
    name: 'story1'
  }, {
    name: 'story2',
    children: [{
      name: 'child1'
    }, {
      name: 'child2',
      frontMatter: {
        order: 33
      }
    }]
  }]
  const { state, mutations } = store
  mutations.SET_STORIES(state, stories)
  stories.forEach((s, idx) => {
    t.is(s.name, state.stories[idx].name)
  })

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

  state.viewModes.forEach((v) => {
    mutations.SET_VIEW_MODE(state, v)
    t.is(state.viewMode, v)
  })

  mutations.SET_VIEW_MODE(state, 'badMode')
  t.is(state.viewMode, 'view')

  mutations.SET_STORY_ORDER(state, {
    idxs: [1],
    order: 22
  })
  mutations.SET_STORY_ORDER(state, {
    idxs: [1, 1],
    order: 44
  })

  t.is(stories[1].frontMatter.order, 22)
  t.is(stories[1].children[1].frontMatter.order, 44)
})

test('Register: watchers', (t) => {
  const watchers = {}
  const called = {}
  const expectedWatchers = [
    '$route.meta.mdPath',
    'storiesData.frontMatter.order'
  ]
  let _info
  const ctx = {
    $store: {
      commit (label, info) {
        t.is(label, '$nuxtStories/SET_STORY_ORDER')
        _info = info
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
  watchers['$route.meta.mdPath']()
  t.true(called.updateStory)

  watchers['storiesData.frontMatter.order'](false)
  t.falsy(_info)

  ctx.$route = {
    meta: {
      idxs: [2]
    }
  }

  watchers['storiesData.frontMatter.order'](33)
  t.truthy(_info)
  t.is(_info.idxs[0], 2)
  t.is(_info.order, 33)
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

test('Methods: Compile Markdown', async (t) => {
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
      meta: {
        mdSavePath: 'somePath'
      }
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
  t.true(called.saveMarkdown)

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

  global.fetch = async function (path) {
    return {
      text () {
        return '# Some fetched markdown'
      }
    }
  }
  await ctx.updateStory()
  t.is(ctx.storiesData.contents, '# Some fetched markdown')

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
