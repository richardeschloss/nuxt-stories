<template>
  <div v-markdown>
    <slot v-show="compiled"></slot>
  </div>
</template>

<script>
import DOMPurify from 'dompurify'
import marked from 'marked'

const renderer = new marked.Renderer();

renderer.table = function(header, body) {
  const hdr = header
    .replace(/align\=\"center\"/g, 'style="text-align: center;"')
    .replace(/align\=\"right\"/g, 'style="text-align: right;"')
  return `<table class="table table-striped">${hdr}${body}</table>`
}

export default {
  directives: {
    markdown: {
      inserted(el, binding, vnode) {
        const input = el.innerHTML.replace(/ {2}/g, '')
        const compiled = marked(input, { renderer })
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
