const cache = {}

export default {
  props: ['src', 'icon'],
  render (h) {
    return h('i')
  },
  async mounted () {
    const src = this.icon
      ? `/nuxtStories/svg/${this.icon}.svg`
      : this.src
    if (!cache[src]) {
      const contents = await fetch(src)
        .then(res => res.text())

      cache[src] = contents
    }
    this.$el.outerHTML = cache[src]
  }
}
