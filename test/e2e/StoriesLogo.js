import test from 'ava'
import Logo from '@/lib/components/StoriesLogo'
import { shallowMount } from '@vue/test-utils'

test('Logo component', (t) => {
  const wrapper = shallowMount(Logo, {})
  const elm = wrapper.find('img')
  t.is(elm.attributes('src'), '~/assets/svg/StoriesLogo.svg')
})