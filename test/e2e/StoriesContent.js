import test from 'ava'
import StoriesContent from '@/lib/components/StoriesContent'
import { shallowMount } from '@vue/test-utils'

test('Stories Content', (t) => {
  const wrapper = shallowMount(StoriesContent, {
    stubs: {
      'b-container': true,
      'b-row': true,
      'story-nav': true,
      'story-content': true,
      'story-toc': true
    }
  })
  const row = wrapper.find('b-row-stub')
  const tagNames = [
    'STORY-NAV-STUB',
    'STORY-CONTENT-STUB',
    'STORY-TOC-STUB'
  ]
  tagNames.forEach((n, idx) => {
    t.is(row.element.children[idx].tagName, n)
  })
})
