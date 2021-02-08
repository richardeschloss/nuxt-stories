export default {
  render(createElement) {
    const self = this
    return createElement('div', {
      style: {
        border: '1px solid',
        background: 'lightblue'
      }
    }, [
      createElement('p','Some text here! Cnt=' + this.cnt),
      createElement('button', {
        on: {
          click: this.inc
        }
      }, 'Click Me')
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