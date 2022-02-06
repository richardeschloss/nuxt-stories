import { h } from 'vue'
export default {
  render () {
    return h('div', {
      id: 'style-editor',
      class: 'nuxt-stories modal show',
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
        // this.state.stylingComp
        //   ?
        h('label', { // TBD: SSR mismatch

        }, 'Editing: ' + this.state.stylingComp),
        // : null,
        h('textarea', {
          class: 'form-control',
          style: {
            height: '300px'
          },
          value: this.state.activeStyle,
          onInput: (evt) => {
            // console.log(this.state.stylingComp)
            this.state.activeStyle = evt.target.value
            if (this.state.stylingComp) {
              console.log('set style...', this.state.activeStyle)
              this.state.styles[this.state.stylingComp] = this.state.activeStyle
              console.log('styles', this.state.styles)
              // this.state.styleElm.style = this.state.activeStyle
            }
            localStorage.setItem('stylingComp', this.state.stylingComp)
            localStorage.setItem('activeStyle', this.state.activeStyle)
            localStorage.setItem('styles', JSON.stringify(this.state.styles))
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
    this.state.stylingComp = localStorage.getItem('stylingComp')
  }
  // computed: {
  //   editingTxt () {
  //     return process.client ? this.state.stylingComp : ''
  //   }
  // }
}
