//import { days, today } from "https://cdn.jsdelivr.net/gh/richardeschloss/les-utils@latest/src/datetime.js"

export function named1() {
  return "I'm from Example4...."
}

export default {
  render(h) { 
    const self = this
    return h('div', {
      style: {
        border: '1px solid',
        background: 'lightblue'
      }
    }, [
      h('p','Some text here! Cnt....=' + this.cnt),
      h('button', {
        on: {
          click: this.inc
        }
      }, 'Click Me'),
      // h('p', 'today is:' + today() + '3')
    ])
  },
  data() {
    return {
      cnt: 0
    }
  },
  methods: {
    inc() {
      this.cnt++
    }
  }
}