export default {
  props: ['story', 'activeHdr'],
  render(h) {
    const tocHdrs = this.toc.map(({ text, depth, href }) => {
      return h('li', {
        staticClass: `toc-entry toc-h${depth}`,
        class: {
          active: href === this.activeHdr
        }
      }, [
        h('a', {
          attrs: {
            href
          },
          on: {
            click: (evt) => {
              evt.preventDefault()
              this.$emit('scrollToId', { text, depth, href })
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