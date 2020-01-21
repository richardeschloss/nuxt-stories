import Vue from 'vue'

import Markdown from '@/components/Markdown'

Vue.component('Markdown', Markdown)

function nuxtStories() {
  // eslint-disable-next-line
  const pluginOptions = <%= JSON.stringify(options) %>

  return Object.freeze({
    options: pluginOptions
  })
}

export default function(context, inject) {
  inject('nuxtStories', nuxtStories)
}
