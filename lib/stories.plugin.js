/* eslint-disable */
import { methods, register } from './plugin.register'

const debug = require('debug')('nuxt-stories')
const pOptions = <%= JSON.stringify(options) %>

register.options(pOptions)
register.components()
register.icons()

function nuxtStories() {
  this.componentDestroy = this.$destroy
  register.storyIO(this)
  Object.assign(this, { ...methods })
  register.watchers(this)
  this.updateStory()
}

Object.defineProperty(nuxtStories, 'options', {
  writable: false,
  value: pOptions
})

Object.defineProperty(nuxtStories, 'mountedAnchor', {
  writable: false,
  value: register.storiesAnchor
})

export default function({ app }, inject) {
  const { store } = app
  const { lang, storiesDir } = pOptions
  register.vuexModule(store)
  store.commit('$nuxtStories/SET_LANG', lang)
  store.commit('$nuxtStories/SET_STORIES_DIR', storiesDir)
  inject('nuxtStories', nuxtStories)
}
