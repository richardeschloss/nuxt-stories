import { h } from 'vue'
export default {
  props: ['file'],
  data () {
    return {
      src: `/nuxtStories/coverage/${this.file}.html?t=${Date.now()}`,
      show: false
    }
  },
  render () {
    const children = this.show
      ? [
          h('iframe', {
            class: 'w-100',
            src: this.src,
            style: {
              height: '750px'
            }
          })
        ]
      : []
    return h('div', [
      h('input', {
        type: 'checkbox',
        value: this.show,
        onClick: (evt) => {
          this.show = evt.target.value
        }
      }),
      ' Show Coverage Report',
      ...children
    ])
  }
}
