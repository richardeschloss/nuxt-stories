import { h } from 'vue'
export default {
  name: 'Hello',
  render () {
    console.log('style here', this.style)
    return h('div', {
      class: 'hello',
      style: this.style,
      editable: true
    }, 'Hi from Hello.js! I am the Hello component. You should after having typed me in!')
  },
  computed: {
    style () {
      return this.$nuxtStories().value?.styles?.Hello
    }
  }
}
