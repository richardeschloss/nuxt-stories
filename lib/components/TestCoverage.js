export default {
  props: ['file'],
  data () {
    return {
      src: `/nuxtStories/coverage/${this.file}.html?t=${Date.now()}`,
      show: false
    }
  },
  render (h) {
    const children = this.show
      ? [
          h('iframe', {
            staticClass: 'w-100',
            attrs: {
              src: this.src
            },
            style: {
              height: '750px'
            }
          })
        ]
      : [h()]
    return h('div', [
      h('input', {
        attrs: {
          type: 'checkbox',
          value: this.show
        },
        on: {
          click: (evt) => {
            this.show = evt.target.value
          }
        }
      }),
      ' Show Coverage Report',
      ...children
    ])
  }
}
