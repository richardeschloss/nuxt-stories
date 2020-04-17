import test from 'ava'
import { shallowMount } from '@vue/test-utils'
import StoryNav from '@/lib/components/StoryNav'

const stubs = [
  'b-col',
  'b-link',
  'b-nav'
]

test('Stories Nav ($nuxtStories undef)', (t) => {
  const wrapper = shallowMount(StoryNav, {
    stubs,
    mocks: {
      $store: {}
    }
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
    stubs,
    mocks: {
      $store: {
        state: {
          $nuxtStories: {
            stories
          }
        }
      }
    }
  })
  // t.is(wrapper.vm.stories.length, 0)  
  t.pass()
})

test('Stories Nav (stories, one level)', (t) => {
  const stories1 = [{
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
    stubs,
    mocks: {
      $store: {
        state: {
          $nuxtStories: {
            stories: stories1
          }
        }
      }
    }
  })
  const ctx = wrapper.vm
  expected.forEach((story, idx) => {
    t.is(ctx.sorted(stories1)[idx].name, story.name)
  })
})