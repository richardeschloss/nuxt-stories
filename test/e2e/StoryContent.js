import test from 'ava'
import { shallowMount } from '@vue/test-utils'
import StoryContent from '@/lib/components/StoryContent'

test('Story Content', (t) => {
  const wrapper = shallowMount(StoryContent, {
    stubs: [
      'b-col',
      'breadcrumbs',
      'nuxt-child'
    ]
  })
  const mainElm = wrapper.find('#story-start')
  t.is(mainElm.constructor.name, 'Wrapper')
  t.true(mainElm.element.innerHTML.includes('nuxt-child-stub'))
})