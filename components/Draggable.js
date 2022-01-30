import { h } from 'vue'
export default {
  render () {
    return h('div', this.$attrs, this.$slots.default())
  },
  props: {
    elmSelector: {
      default: null
    }
  },
  mounted () {
    const { $el: elm } = this
    const useElm = this.elmSelector
      ? elm.querySelector(this.elmSelector)
      : elm
    if (!useElm) { return }
    const startPos = { x: 0, y: 0 }
    const finalPos = { x: 0, y: 0 }
    useElm.draggable = true
    useElm.onmouseover = (e) => {
      // useElm.style.cursor = 'move'
    }
    useElm.ondragstart = (e) => {
      startPos.x = e.clientX - finalPos.x
      startPos.y = e.clientY - finalPos.y
    }
    useElm.ondrag = (e) => {
      useElm.style.transform = `translate(${e.clientX - startPos.x}px, ${e.clientY - startPos.y}px)`
    }
    useElm.ondragend = (e) => {
      useElm.style.transform = `translate(${e.clientX - startPos.x}px, ${e.clientY - startPos.y}px)`
      finalPos.x = e.clientX - startPos.x
      finalPos.y = e.clientY - startPos.y
    }
  }
}
