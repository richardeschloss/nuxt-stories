import 'jsdom-global/register.js'
import Vue from 'vue/dist/vue.runtime.esm.js'
import ava from 'ava'
import Hello from '../../components/Hello.js'

const { serial: test } = ava

test('Hello', (t) => {
  const Comp = Vue.extend(Hello)
  const comp = new Comp({}).$mount()
  t.is(comp.$el.innerHTML, 'Hi see me? You should after having typed me in!')
})