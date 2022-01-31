import { h } from 'vue'
import Draggable from './Draggable'

export default {
  data () {
    return {
      filter: '',
      state: this.$nuxtStories()
    }
  },
  render () {
    const componentList = Object.keys(this.$.appContext.components)
      .filter(key =>
        !key.startsWith('Lazy') &&
        this.$.appContext.components[key].name === 'AsyncComponentWrapper' && // TBD: only show app-specific components
        key.match(this.filter)
      )
      .map((key) => {
        return h(Draggable, {
          onDragend: (evt) => {
            evt.target.style.transform = 'unset'
            this.state.addIt = `<${key} />` // TBD: better property name?
          }
        }, () => [h('li', {
          class: 'py-1 text-center',
          style: {
            'list-style': 'none',
            'border-bottom': '1px solid rgba(150, 150, 150, 0.3)',
            'border-collapse': 'collapse'
          }
        }, key)])
      })

    return h('div', {
      class: 'modal show',
      style: {
        display: 'block',
        background: 'white',
        width: '25%',
        height: '50%',
        right: 0,
        left: 'unset',
        bottom: 0,
        top: 'unset',
        'box-shadow': '-5px -5px rgba(150, 150, 150, 0.3)'
        // transition: 'width 0.3s'
      }
    }, [
      h('input', {
        class: 'form-control text-center',
        placeholder: 'Filter',
        value: this.filter,
        onInput: (evt) => {
          this.filter = evt.target.value
        }
      }),
      h('ul', {
        class: 'modal-body'
      }, componentList)
    ])
  },
  methods: {
  }
}
