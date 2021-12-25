export default {
  props: ['src'],
  render (h) {
    return h('div')
  },
  async mounted () {
    this.$el.innerHTML = await fetch(this.src)
      .then(res => res.text())
  }
}
