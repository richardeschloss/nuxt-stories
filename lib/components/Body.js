import { h } from 'vue'
import SideNav from './SideNav.js'
// import Main from './Main.js'
export default {
  render () {
    return h('div', {
      class: 'container-xxl my-md-2 bd-layout'
    }, [
      h(SideNav)
      // h(Main)
    ])
  },
  mounted () {
    const sidebarWidth = parseFloat(window.getComputedStyle(this.$el.children[0]).width)
    // @ts-ignore
    new ResizeObserver((entries) => {
      if (entries[0].contentRect.width < sidebarWidth) {
        if (this.$el.children[1]) {
          // it's only truthy if we have an active story...
          this.$el.children[1].style['margin-left'] = `${entries[0].contentRect.width - sidebarWidth}px`
        }
      }
    }).observe(this.$el.children[0])
  }
}
