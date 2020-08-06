import test, { beforeEach } from 'ava'
import Vuex from 'vuex'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import StoriesHeader from '@/lib/components/StoriesHeader'
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

test('Stories Header (view mode controls)', (t) => {
  const wrapper = shallowMount(StoriesHeader, {
    localVue,
    store,
    stubs: [
      'stories-logo'
    ],
    mocks: {
      $nuxtStories: {
        options: {
          storiesAnchor: 'stories'
        }
      }
    }
  })
  t.is(wrapper.vm.githubURL, 'https://github.com/richardeschloss/nuxt-stories')
  t.false(wrapper.vm.modeActive('split'))

  const expectedModes = [
    { name: 'edit', icon: 'pencil' },
    { name: 'split', icon: 'layout-split' },
    { name: 'view', icon: 'eye-fill' }
  ]
  expectedModes.forEach((m, idx) => {
    t.is(wrapper.vm.modes[idx].name, m.name)
    t.is(wrapper.vm.modes[idx].icon, m.icon)
  })

  const { vm: ctx } = wrapper

  ctx.setViewMode('split')
  t.is(ctx.$store.state.$nuxtStories.viewMode, 'split')
  t.true(ctx.modeActive('split'))

  const brandElm = wrapper.find('#brand-link')
  t.is(brandElm.attributes().to, '/stories')
})

test('Stories Header ($nuxtStories, store undef)', (t) => {
  const wrapper = shallowMount(StoriesHeader, {
    localVue,
    store: {

    },
    stubs: [
      'stories-logo'
    ]
  })

  const { vm: ctx } = wrapper
  const brandElm = wrapper.find('#brand-link')
  t.is(brandElm.attributes().to, '')
  t.false(ctx.modeActive('view'))
})
