import { h } from 'vue'
import { delay } from 'les-utils/utils/promise.js'
export default {
  props: ['story', 'activeHdr', 'viewerScrolling'],
  data () {
    return {
      navigating: false
    }
  },
  render () {
    const tocHdrs = this.toc.map(({ text, depth, href }) => {
      return h('li', {
        class: `toc-entry toc-h${depth}` +
          (href === this.$route.hash ? ' active' : '')
      }, [
        h('a', {
          href,
          onClick: async (evt) => {
            this.navigating = true
            evt.preventDefault()
            if (href === this.$route.hash) {
              this.$router.push('')
              await delay(1)
            }

            this.$router.push(href)
          }
        }, text)
      ])
    })
    return h('div', {
      class: 'bd-toc mb-5 my-md-0 ps-xl-3 mb-lg-5 text-muted'
    }, [
      h('nav', [
        h('ul', {
          class: 'section-nav'
        }, tocHdrs)
      ])
    ])
  },
  watch: {
    activeHdr (n) {
      if (!this.navigating && n) {
        this.$router.push(n)
      }
    },
    viewerScrolling (n) {
      if (!n) {
        this.navigating = false
      }
    }
  },
  computed: {
    toc () {
      return this.story.toc
    }
  }
}
