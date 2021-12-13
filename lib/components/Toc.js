import { delay } from 'les-utils/utils/promise.js'
export default {
  props: ['story', 'activeHdr', 'viewerScrolling'],
  data() {
    return {
      navigating: false
    }
  },
  render(h) {
    const tocHdrs = this.toc.map(({ text, depth, href }) => {
      return h('li', {
        staticClass: `toc-entry toc-h${depth}`,
        class: {
          active: href === this.$route.hash
        }
      }, [
        h('a', {
          attrs: {
            href
          },
          on: {
            click: async (evt) => {
              this.navigating = true
              evt.preventDefault()
              if (href === this.$route.hash) {
                this.$router.push('')
                await delay(1)
              } 
              
              this.$router.push(href)
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
  watch: {
    activeHdr(n) {
      if (!this.navigating) {
        this.$router.push(n)
      }
    },
    viewerScrolling(n) {
      if (!n) {
        this.navigating = false
      }
    }  
  },
  computed: {
    toc() {
      return this.story.toc
    }
  }
}