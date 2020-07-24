import test from 'ava'
import Breadcrumbs from '@/lib/components/Breadcrumbs'
import { shallowMount } from '@vue/test-utils'

const bBreadcrumb = () => ({
  render (h) {
    return h('div')
  }
})

function validateItems (t, expected, actual) {
  expected.forEach((item, idx) => {
    t.is(item.text, actual[idx].text)
    t.is(item.to, actual[idx].to)
  })
}

test('Breadcrumbs ($nuxtStories undefined)', (t) => {
  const $nuxtStories = {
    options: {
      storiesAnchor: 'stories'
    }
  }
  const $route = {
    name: 'index-stories'
  }
  const wrapper = shallowMount(Breadcrumbs, {
    stubs: {
      'b-breadcrumb': bBreadcrumb()
    },
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
    name: 'index-stories-child1'
  }
  const wrapper = shallowMount(Breadcrumbs, {
    stubs: {
      'b-breadcrumb': bBreadcrumb()
    },
    mocks: {
      $nuxtStories,
      $route
    }
  })
  const expected = [
    { text: 'App', to: '/' },
    { text: 'Stories', to: '/stories' },
    { text: 'child1', to: '/stories/child1' }
  ]
  validateItems(t, expected, wrapper.vm.items)
})
