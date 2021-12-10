export default {
  render(h) {
    return h('div', {
      staticClass: 'toggled',
      style: {
        transition: `height ${this.duration}ms ease`,
        display: this.display,
        overflow: this.overflow,
        height: this.height
      },
      on: { 
        ...this.$listeners
      }
    }, this.$slots.default)
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    duration: {
      type: Number,
      default: 350
    }
  },
  data() {
    return {
      display: '',
      height: '',
      overflow: ''
    }
  },
  watch: {
    show(n) {
      this.display = ''
      this.overflow = 'hidden'
      if (n) {
        this.height = '0px'
        this.$nextTick(() => {
          this.height = `${this.$el.scrollHeight}px`
          setTimeout(() => {
            this.height = ''
            this.overflow = ''
          }, this.duration)
        })
      } else {
        this.height = `${this.$el.scrollHeight}px`
        this.$nextTick(() => {
          this.height = `0px`   
        })
      }
    }
  },
  mounted() {
    if (this.show) {
      this.height = `${this.$el.scrollHeight}px`
      this.display = ''
      this.overflow = 'hidden'
    } else {
      this.height = ''
      this.display = 'none'
      this.overflow = ''
    }
  }
}