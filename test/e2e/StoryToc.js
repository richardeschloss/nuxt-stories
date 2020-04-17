import test from 'ava'
import { shallowMount } from '@vue/test-utils'
import StoryToc from '@/lib/components/StoryToc'

const stubs = [
  'b-col',
  'b-link',
  'b-nav'
]

test('Story TOC (state undef)', (t) => {
  StoryToc.directives = {
    'b-scrollspy': {}
  }
  const wrapper = shallowMount(StoryToc, {
    stubs,
    mocks: {
      $store: {
        state: {}
      }
    }
  })
  const ctx = wrapper.vm
  t.is(ctx.toc.length, 0)
})

test('Story TOC', (t) => {
  StoryToc.directives = {
    'b-scrollspy': {}
  }
  const toc = [{
    text: 'Heading',
    depth: 1,
    href: '#heading'
  }, {
    text: 'SubHeading',
    depth: 2,
    href: '#sub-heading'
  }]
  const tocKeys = Object.keys(toc[0])
  const wrapper = shallowMount(StoryToc, {
    data() {
      return {
        contentElm: {}
      }
    },
    stubs,
    mocks: {
      $store: {
        state: {
          $nuxtStories: {
            toc
          }
        }
      }
    }
  })
  const ctx = wrapper.vm
  toc.forEach((entry, idx) => {
    tocKeys.forEach((key) => {
      t.is(entry[key], ctx.toc[idx][key])
    })
  })

  t.is(ctx.hdrClass(toc[1]), 'toc-h2')
})