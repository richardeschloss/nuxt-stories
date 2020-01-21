<template>
  <div v-markdown>
    <slot v-show="compiled"></slot>
  </div>
</template>

<script>
import DOMPurify from 'dompurify'
import marked from 'marked'

export default {
  directives: {
    markdown: {
      inserted(el, binding, vnode) {
        const input = el.innerHTML.replace(/ {2}/g, '')
        const compiled = marked(input, {})
        el.innerHTML = DOMPurify.sanitize(compiled)
        vnode.context.compiled = true
      }
    }
  },
  data() {
    return {
      compiled: false
    }
  }
}
</script>
