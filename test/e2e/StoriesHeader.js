import test from 'ava'
import { shallowMount } from '@vue/test-utils'
import StoriesHeader from '@/lib/components/StoriesHeader'

test('Stories Header', (t) => {
  const committed = {}
  const state = {}
  const wrapper = shallowMount(StoriesHeader, {
    stubs: [
      'b-icon',
      'b-navbar',
      'b-navbar-brand',
      'stories-logo',
      'b-navbar-nav',
      'b-button-group',
      'b-button',
      'b-form-input',
      'b-navbar-toggle',
      'b-collapse',
      'b-nav-item-dropdown',
      'b-nav-item',
      'b-icon',
      'b-dropdown-item'
    ],
    mocks: {
      $nuxtStories: {
        options: {
          storiesAnchor: ''
        }
      },
      $store: {
        state,
        commit (label, data) {
          committed[label] = data
          Object.assign(state, {
            $nuxtStories: {
              viewMode: data
            }
          })
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

  wrapper.vm.setViewMode('split')
  t.is(committed['$nuxtStories/SET_VIEW_MODE'], 'split')
  t.true(wrapper.vm.modeActive('split'))
})
