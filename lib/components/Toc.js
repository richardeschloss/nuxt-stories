export default {
  props: ['story'],
  render(h) {
    const tocHdrs = this.toc.map(({ text, depth, href }) => {
      return h('li', {
        staticClass: `toc-entry toc-h${depth}`
      }, [
        h('a', {
          attrs: {
            href 
          },
          on: {
            click: (evt) => {
              evt.preventDefault()
              this.$emit('scrollToId', href)
            }
          }
        }, text)
      ])
    })
    return h('div', {
      staticClass: 'bd-toc mb-5 my-md-0 ps-xl-3 mb-lg-5 text-muted'
    }, [
      h('nav', [
        h('ul', {
          staticClass: 'section-nav'
        }, tocHdrs)
      ])
    ])
  },
  computed: {
    toc() {
      return this.story.toc
    }
  }
}