import { h, nextTick } from 'vue'
import { delay } from 'les-utils/utils/promise.js'

export default {
  render () {
    return h('div', {
      class: 'toggled',
      style: {
        transition: `height ${this.duration}ms ease`,
        display: this.display,
        overflow: this.overflow,
        height: this.height
      }
    }, this.$slots.default())
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
  data () {
    return {
      display: '',
      height: '',
      overflow: ''
    }
  },
  watch: {
    async show (n) {
      this.display = ''
      this.overflow = 'hidden'
      if (n) {
        this.height = '0px'
        await nextTick()
        this.height = `${this.$el.scrollHeight}px`
        await delay(this.duration)
        this.height = ''
        this.overflow = ''
      } else {
        this.height = `${this.$el.scrollHeight}px`
        await nextTick()
        await delay(this.duration / 4)
        this.height = '0px'
      }
    }
  },
  async mounted () {
    if (this.show) {
      this.display = ''
      this.overflow = 'hidden'
    } else {
      this.display = 'none'
      this.overflow = ''
      await nextTick()
      this.height = ''
    }
  }
}
