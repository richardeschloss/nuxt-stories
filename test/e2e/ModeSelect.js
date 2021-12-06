// @ts-nocheck
import 'jsdom-global/register.js'
import ava from 'ava'
import Vue from 'vue/dist/vue.runtime.esm.js'
import Vuex from 'vuex'
import ModeSelect from '#root/lib/components/ModeSelect.js'
import { state, mutations } from '#root/lib/store/nuxtStories.js'

const { serial: test, beforeEach } = ava

Vue.use(Vuex)
let store

beforeEach(() => {
  store = new Vuex.Store({
    state: {},
    modules: {
      $nuxtStories: {
        namespaced: true,
        state: state(),
        mutations
      }
    }
  })
})

test('ModeSelect', async (t) => {
  const Comp = Vue.extend(ModeSelect)
  const comp = new Comp({})
  const mocks = {
    $store: store
  }
  Object.assign(comp, mocks)
  await comp.$mount()
  const viewBtn = comp.$el.querySelector('.bi-eye-fill')
  viewBtn.click()
  t.is(comp.$store.state.$nuxtStories.viewMode, 'view')

  const editBtn = comp.$el.querySelector('.bi-pencil')
  editBtn.click()
  t.is(comp.$store.state.$nuxtStories.viewMode, 'edit')

  const splitBtn = comp.$el.querySelector('.bi-layout-split')
  splitBtn.click()
  t.is(comp.$store.state.$nuxtStories.viewMode, 'split')

  const comp2 = new Comp({})
  Object.assign(comp2, {
    $store: {
      state: {}
    }
  })
  
  await comp2.$mount()
  t.false(comp2.modeActive('view'))
})

