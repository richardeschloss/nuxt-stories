import test from 'ava'
import { shallowMount } from '@vue/test-utils'
import Markdown from '@/lib/components/Markdown'

test('Markdown wrapper', (t) => {
  const { directives } = Markdown
  const wrapper = shallowMount(Markdown, {
    slots: {
      default: '# Hi I am markdown'
    }
  })
  t.truthy(directives.markdown.inserted)
  t.truthy(directives.markdown.componentUpdated)
  t.is(directives.markdown.inserted, directives.markdown.componentUpdated)
  t.is(wrapper.vm.compiled.trim(), '<h1 id="hi-i-am-markdown">Hi I am markdown</h1>')
})
