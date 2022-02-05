import { h } from 'vue'
export default {
  render () {
    return h('div', {
      id: 'style-editor',
      class: 'modal show',
      style: {
        'z-index': this.zIndex,
        background: 'white',
        width: this.modalWidth,
        height: this.modalHeight,
        'box-shadow': '0px 8px 10px 1px rgb(0 0 0 / 14%), 0px 3px 14px 2px rgb(0 0 0 / 12%), 0px 5px 5px -3px rgb(0 0 0 / 20%)',
        transition: 'width 0.3s ease, height 0.3s ease'
      },
      onMouseenter: () => {
        this.modalWidth = 'fit-content'
        this.modalHeight = '50%'
        this.zIndex = 1056
      },
      onMouseleave: () => {
        this.modalWidth = '15%'
        this.modalHeight = '20%'
        this.zIndex = 1054
      }
    }, [
      h('div', {
        class: 'modal-header py-1',
        style: {
          'background-color': '#343a40',
          color: 'white'
        }
      }, [
        h('h5', {
          class: 'modal-title'
        }, 'Style Editor')
      ]),
      h('div', {
        class: 'modal-body'
      }, [
        h('textarea', {
          class: 'form-control',
          style: {
            height: '300px'
          }
        })
      ])
    ])
  },
  data () {
    return {
      state: this.$nuxtStories(),
      modalWidth: '15%',
      modalHeight: '20%',
      zIndex: 1054
    }
  },
  mounted () {
    Object.assign(this.$el.style, {
      display: 'block',
      right: '5%',
      left: 'unset',
      bottom: 0,
      top: 'unset'
    })
  }
}
