import { serial as test, beforeEach } from 'ava'
import Vuex from 'vuex'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import StoryNavItem from '@/lib/components/StoryNavItem'

let localVue

const mockStore = (called) => {
  return {
    $store: {
      commit (label, data) {
        called.commit[label].push(data)
      },
      dispatch (label, data) {
        called.dispatch[label].push(data)
      }
    }
  }
}

function isVisible (elm) {
  const { getComputedStyle } = elm.ownerDocument.defaultView
  const { display } = getComputedStyle(elm)
  return display === ''
}

beforeEach(() => {
  localVue = createLocalVue()
  localVue.use(Vuex)
  localVue.use(BootstrapVue)
  localVue.use(BootstrapVueIcons)
})

test('Mode: View and Pre-action (showCRUD false)', (t) => {
  const story = {
    name: 'Some Story',
    hovered: true
  }
  const wrapper = shallowMount(StoryNavItem, {
    localVue,
    propsData: {
      story
    },
    stubs: {
      'b-dropdown-item': {
        template: '<div @click="$listeners.click" />'
      }
    }
  })
  const elm = wrapper.find('#dropdown-left')
  t.false(elm.exists())
  t.is(wrapper.vm.newName, story.name)
})

test('Mode: View and Pre-action (showCRUD)', (t) => {
  const called = {
    commit: {
      '$nuxtStories/SET_STORY_DATA': []
    },
    dispatch: {
      '$nuxtStories/ADD': []
    }
  }

  const story = {
    name: 'Some Story',
    hovered: true,
    idxs: [0]
  }
  const wrapper = shallowMount(StoryNavItem, {
    localVue,
    propsData: {
      story,
      crud: true
    },
    stubs: {
      'b-dropdown-item': {
        template: '<div @click="$listeners.click" />'
      }
    },
    mocks: mockStore(called)
  })
  const dropdown = wrapper.find('#dropdown-left').element
  t.true(isVisible(dropdown))

  const elm = wrapper.find('.story-name')
  t.is(elm.text(), 'Some Story')
  const elms = [
    wrapper.find('.add'),
    wrapper.find('.pre-rename'),
    wrapper.find('.pre-remove')
  ]
  elms.forEach(async (elm) => {
    await elm.trigger('click')
  })

  const d = called.dispatch['$nuxtStories/ADD'][0]
  const c = called.commit['$nuxtStories/SET_STORY_DATA']
  t.is(d.name, story.name)
  t.is(c.length, 2)
  c.forEach((entry, idx) => {
    t.is(entry.idxs[0], story.idxs[0])
    if (idx === 0) {
      t.true(entry.data.rename)
    } else {
      t.true(entry.data.remove)
    }
  })
})

test('Mode: Rename', (t) => {
  const called = {
    commit: {
      '$nuxtStories/SET_STORY_DATA': []
    },
    dispatch: {
      '$nuxtStories/RENAME': []
    }
  }

  const story = {
    name: 'Some Story',
    rename: true,
    hovered: false,
    idxs: [0]
  }
  const wrapper = shallowMount(StoryNavItem, {
    localVue,
    propsData: {
      story
    },
    data () {
      return {
        newName: 'Diff name'
      }
    },
    stubs: {
      'b-button': {
        template: '<div @click="$listeners.click" />'
      },
      'b-form-input': {
        template: '<div @keyup.enter="$listeners.keyup" />'
      }
    },
    mocks: mockStore(called)
  })
  const dropdown = wrapper.find('#dropdown-left')
  t.falsy(dropdown.element)

  const newName = wrapper.find('.new-name')
  t.true(newName.exists())
  newName.trigger('keyup.enter')

  const elm = wrapper.find('.rename')
  elm.trigger('click')

  const cancelElm = wrapper.find('.cancel')
  cancelElm.trigger('click')

  const d1 = called.dispatch['$nuxtStories/RENAME']
  t.is(d1.length, 2)
  t.is(d1[0].story.name, story.name)
  t.is(d1[0].newName, wrapper.vm.newName)

  const c1 = called.commit['$nuxtStories/SET_STORY_DATA']
  t.is(c1[0].idxs[0], story.idxs[0])
  t.false(c1[0].data.rename)
})

test('Mode: Remove', (t) => {
  const called = {
    commit: {
      '$nuxtStories/SET_STORY_DATA': []
    },
    dispatch: {
      '$nuxtStories/REMOVE': []
    }
  }

  const story = {
    name: 'Some Story',
    remove: true,
    idxs: [0]
  }
  const wrapper = shallowMount(StoryNavItem, {
    localVue,
    propsData: {
      story
    },
    stubs: {
      'b-button': {
        template: '<div @click="$listeners.click" />'
      }
    },
    mocks: mockStore(called)
  })
  const elms = [
    '.remove',
    '.cancel'
  ]

  elms.forEach((key) => {
    wrapper.find(key).trigger('click')
  })

  const d1 = called.dispatch['$nuxtStories/REMOVE']
  t.is(d1[0].name, story.name)

  const c1 = called.commit['$nuxtStories/SET_STORY_DATA']
  t.is(c1[0].idxs[0], story.idxs[0])
  t.false(c1[0].data.remove)
})

test('Story undefined', (t) => {
  const wrapper = shallowMount(StoryNavItem, {
    localVue,
    propsData: {
      level: 100,
      depth: 0
    }
  })
  const elm = wrapper.find('.story-name')
  t.falsy(elm.text())

  const add = wrapper.find('.add')
  t.false(add.exists())
})
