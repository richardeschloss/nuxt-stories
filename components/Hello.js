import { h } from 'vue'
export default {
  render () {
    return h('div', {
      class: 'this that hello',
      editable: true
    }, [
      'Hi from Hello.js! I am the Hello component. You should after having typed me in!',
      h('p', {
        id: 'hello-child'
      }, 'Nested child')
    ])
  }
}
