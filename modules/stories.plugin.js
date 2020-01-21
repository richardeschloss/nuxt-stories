import Vue from 'vue'
import Markdown from '@/.stories/.components/Markdown'

function PluginOptions() {
  let _pOptions = <%= JSON.stringify(options) %>
  return Object.freeze({
    get: () => _pOptions,
    set: (opts) => {
      _pOptions = opts
    }
  })
}

const pOptions = PluginOptions()
const { markdownEnabled } = pOptions.get()

if (markdownEnabled) {
  Vue.component('Markdown', Markdown)
}

function nuxtStories() {
  return Object.freeze({
    options: pOptions.get()
  })
}

export default function(context, inject) {
  inject('nuxtStories', nuxtStories)
}
