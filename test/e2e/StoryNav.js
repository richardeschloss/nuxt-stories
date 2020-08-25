import { serial as test, beforeEach } from 'ava'
import Vuex from 'vuex'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import StoryNav from '@/lib/components/StoryNav'
import { state, mutations } from '@/lib/store/nuxtStories'

let localVue
let store
const vuexModules = {
  '$nuxtStories': {
    namespaced: true,
    state: state(),
    mutations
  }
}

const stubs = [
  'story-nav-item'
]

const mocks = {
  $nuxtStories: {
    options: {}
  }
}

beforeEach(() => {
  localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(BootstrapVue)
  localVue.use(BootstrapVueIcons)
  store = new Vuex.Store({
    state: {},
    modules: vuexModules
  })
})

test('Hover events', async (t) => {
  const stories = [{
    name: 'story1',
    path: 'story1',
    mdPath: 'stories/en/story1.md',
    idxs: [0],
    children: [{
      name: 'child1',
      idxs: [0, 0]
    }]
  }]
  const wrapper = shallowMount(StoryNav, {
    localVue,
    store,
    mocks,
    stubs
  })
  store.commit('$nuxtStories/SET_STORIES', stories)
  const { vm: ctx } = wrapper
  await ctx.$nextTick()
  const storyLink = wrapper.find('.l0-link')
  const childLink = wrapper.find('.l1-link')

  storyLink.trigger('mouseover')
  t.true(stories[0].hovered)
  storyLink.trigger('mouseout')
  t.false(stories[0].hovered)

  childLink.trigger('mouseover')
  const child = stories[0].children[0]
  t.true(child.hovered)
  childLink.trigger('mouseout')
  t.false(child.hovered)
})

test('Directives (crud listeners not added for static host)', (t) => {
  const { directives } = StoryNav
  const el = {
    addEventListener () {
      el.registered = true
    }
  }
  const binding = {}
  const vnode = {
    context: {
      $nuxtStories: {
        options: {
          staticHost: true
        }
      }
    }
  }
  directives.storyHover.inserted(el, binding, vnode)
  t.falsy(el.registered)
})

test('Stories Nav ($nuxtStories undef)', (t) => {
  const wrapper = shallowMount(StoryNav, {
    localVue,
    mocks: {
      $store: {},
      ...mocks
    },
    stubs
  })
  t.is(wrapper.vm.stories.length, 0)
})

test('Stories Nav (frontMatter undef)', (t) => {
  const stories = [{
    name: 'story1'
  }, {
    name: 'story2'
  }]
  const wrapper = shallowMount(StoryNav, {
    localVue,
    store,
    mocks,
    stubs
  })
  store.commit('$nuxtStories/SET_STORIES', stories)
  const ctx = wrapper.vm
  ctx.stories.forEach((s, idx) => {
    t.is(s.name, stories[idx].name)
  })
})

test('Stories Nav (stories, one level)', (t) => {
  const stories = [{
    name: 'story1',
    frontMatter: {
      order: 2
    }
  }, {
    name: 'story2',
    frontMatter: {
      order: 1
    },
    children: [{
      name: 'child1',
      frontMatter: {
        order: 2
      }
    }, {
      name: 'child2',
      frontMatter: {
        order: 1
      }
    }]
  }, {
    name: 'story3',
    frontMatter: {
      order: 11
    }
  }]

  const expected = [{
    name: 'story2',
    children: [{
      name: 'child2'
    }, {
      name: 'child1'
    }]
  }, {
    name: 'story1'
  }]
  const wrapper = shallowMount(StoryNav, {
    localVue,
    store,
    mocks,
    stubs
  })
  store.commit('$nuxtStories/SET_STORIES', stories)
  const ctx = wrapper.vm
  expected.forEach((story, idx) => {
    t.is(ctx.sorted(stories)[idx].name, story.name)
  })
})

test('Add first story', async (t) => {
  const called = {
    dispatch: {
      '$nuxtStories/ADD': []
    }
  }
  const wrapper = shallowMount(StoryNav, {
    localVue,
    mocks: {
      $store: {
        dispatch (label, data) {
          called.dispatch[label].push(data)
        }
      },
      ...mocks
    },
    stubs: {
      'b-button': {
        template: '<button @click="$listeners.click" />'
      },
      'story-nav-item': true
    }
  })
  await wrapper.vm.$nextTick()
  const elm = wrapper.find('#addStory')
  elm.trigger('click')
  const d = called.dispatch['$nuxtStories/ADD']
  t.is(d.length, 1)
  t.is(d[0], undefined)
})
