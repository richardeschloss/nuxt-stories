import { h } from 'vue'
export default {
  render () {
    return h('div', {
      style: {
        color: 'blue'
      }
    }, 'Hi from Hello.js! I am the Hello component. You should after having typed me in!')
  }
}
