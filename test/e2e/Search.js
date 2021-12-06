// @ts-nocheck
import 'jsdom-global/register.js'
import { readFileSync } from 'fs'
import { resolve as pResolve } from 'path'
import ava from 'ava'
import Vue from 'vue/dist/vue.runtime.esm.js'
import Search from '#root/lib/components/Search.js'
import { delay } from 'les-utils/utils/promise.js'

const { serial: test } = ava

const fetched = []
global.fetch = async function(url) {
  fetched.push(url)
  return {
    json() {
      return JSON.parse(readFileSync(pResolve('./stories/stories.db'), { encoding: 'utf-8' }))
    }
  }
}

test('Search (ssr)', async (t) => {
  const Comp = Vue.extend(Search)
  let comp = new Comp({})
  const mocks = {
    $config: {
      nuxtStories: {

      }
    },
    $nuxtSocket(opts) {
      t.is(opts.channel, '/')
      t.is(opts.persist, 'storiesSocket') 
      t.is(opts.namespaceCfg.emitters[0], 'searchStories') 
    },
    async searchStories(q) {
      return [{labels: ['Docs']}]
    }
  }
  Object.assign(comp, mocks)
  comp = await comp.$mount()
  const keydown = new Event('keydown')
  keydown.ctrlKey = true
  keydown.key = '/'
  window.dispatchEvent(keydown)
  // For some reason, active element doesn't update
  // in jsdom and this testing environment :( , but we know it's focused
  // (works manually)
  t.is(comp.q, '')
  t.is(comp.hits.length, 0)

  const input = new Event('input')
  const inputElm = comp.$el.querySelector('input')
  inputElm.value = 'Exa'
  inputElm.dispatchEvent(input)
  await delay(comp.debounceMs)
  t.is(comp.q, inputElm.value)
  t.truthy(comp.hits.length > 0)

  window.dispatchEvent(keydown)
  await delay(100)
  t.is(comp.q, '')
  t.is(comp.hits.length, 0)

  comp.$destroy()
  inputElm.value = 'Exa'
  inputElm.dispatchEvent(input)
  await delay(comp.debounceMs)
  t.is(comp.q, inputElm.value)
  t.truthy(comp.hits.length > 0)

  window.dispatchEvent(keydown)
  await delay(100)
  t.is(comp.q, inputElm.value)
})

test('Search (client)', async (t) => {
  const Comp = Vue.extend(Search)
  let comp = new Comp({})
  const routes = []
  const mocks = {
    $config: {
      nuxtStories: {
        staticHost: true
      }
    },
    $router: {
      push(href) {
        routes.push(href)
      }
    }
  }
  Object.assign(comp, mocks)
  comp = await comp.$mount()
  
  const input = new Event('input')
  const inputElm = comp.$el.querySelector('input')
  inputElm.value = 'Exa'
  inputElm.dispatchEvent(input)
  await delay(comp.debounceMs)
  t.is(comp.q, inputElm.value)
  t.truthy(comp.hits.length > 0)
  t.truthy(comp.hits[0].href)
  t.truthy(comp.hits[0].labels)
  t.truthy(comp.hits[0].preview)

  const toHref = comp.hits[0].href
  comp.toStory(comp.hits[0].href)
  t.is(routes[0], toHref)

  inputElm.dispatchEvent(input)
  await delay(comp.debounceMs)
  const linkElm = comp.$el.querySelector('.nuxt-link')
  linkElm.click()
  t.is(routes[1], toHref)

  inputElm.dispatchEvent(input)
  await delay(comp.debounceMs)
  const previewElm = comp.$el.querySelector('.nuxt-story-preview')
  previewElm.click()
  t.is(routes[2], toHref)
})

