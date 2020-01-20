import DOMPurify from 'dompurify'
import marked from 'marked'
import Vue from 'vue'

Vue.directive('markdown', {
  inserted(el) {
    const compiled = marked(el.textContent.trim())
    el.innerHTML = DOMPurify.sanitize(compiled)
    el.style.display = 'block'
  }
})

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
