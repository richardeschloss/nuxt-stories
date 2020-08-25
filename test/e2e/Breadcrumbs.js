import test, { beforeEach } from 'ava'
import { BootstrapVue } from 'bootstrap-vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Breadcrumbs from '@/lib/components/Breadcrumbs'

let localVue

function validateItems (t, expected, actual) {
  expected.forEach((item, idx) => {
    t.is(item.text, actual[idx].text)
    t.is(item.to, actual[idx].to)
  })
}

beforeEach(() => {
  localVue = createLocalVue()
  localVue.use(BootstrapVue)
})

test('Breadcrumbs ($nuxtStories undefined)', (t) => {
  const $route = {
    name: 'stories',
    path: '/stories'
  }
  const wrapper = shallowMount(Breadcrumbs, {
    localVue,
    mocks: {
      $route
    }
  })
  const expected = [
    { text: 'App', to: '/' },
    { text: 'Stories', to: '' }
  ]
  validateItems(t, expected, wrapper.vm.items)
})

test('Breadcrumbs ($nuxtStories defined)', (t) => {
  const $nuxtStories = {
    options: {
      storiesAnchor: 'stories'
    }
  }
  const $route = {
    name: 'stories/en/child1',
    path: '/stories/en/child1'
  }
  const wrapper = shallowMount(Breadcrumbs, {
    localVue,
    mocks: {
      $nuxtStories,
      $route
    }
  })
  const expected = [
    { text: 'App', to: '/' },
    { text: 'Stories', to: '/stories' },
    { text: 'child1', to: '/stories/en/child1' }
  ]
  validateItems(t, expected, wrapper.vm.items)
})
