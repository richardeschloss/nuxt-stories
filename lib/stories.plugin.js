/* eslint-disable */
import { methods, register } from './plugin.register'

const debug = require('debug')('nuxt-stories')
const pOptions = <%= JSON.stringify(options) %>

function nuxtStories() {
  this.componentDestroy = this.$destroy
  this.socket = this.$nuxtSocket({
    name: 'nuxtStories',
    channel: '',
    namespaceCfg: {
      emitters: ['saveMarkdown + storiesData']
    }
  })
  Object.assign(this, { ...methods })
  register.watchers(this)
  this.updateStory()
}

Object.defineProperty(nuxtStories, 'options', {
  writable: false,
  value: pOptions
})
if (!process.env.TEST) {
  register.components()
}
register.icons()
export default function({ app }, inject) {
  const { store, router } = app
  register.vuexModule(store)
  register.stories(store, router, pOptions.storiesAnchor)
  inject('nuxtStories', nuxtStories)
}
