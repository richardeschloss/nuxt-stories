import { h } from 'vue'
export default {
  render () {
    return h('div', {
      class: 'dropdown'
    }, [
      h('input', {
        class: 'dropdown-toggle form-control',
        value: this.selectedItem.label,
        onInput: (evt) => {
          this.filter = evt.target.value
          this.selectedItem.label = this.filter
          this.$emit('itemSelected', { label: this.filter })
        },
        onClick: (evt) => {
          evt.preventDefault()
          this.showDropdown = !this.showDropdown
        }
      }),
      h('ul', {
        class: 'dropdown-menu' +
          (this.showDropdown ? ' show' : '') +
          (this.right ? ' right' : ''),
        style: {
          height: '200px',
          'overflow-y': 'scroll',
          width: '100%'
        }
      },
      this.filteredItems.map(item =>
        h('li', {
          class: item.disabled ? 'disabled' : ''
        }, [
          h('a', {
            class: 'dropdown-item',
            ...item,
            href: '#',
            onClick: (evt) => {
              evt.preventDefault()
              this.selectedItem = item
              this.$emit('itemSelected', item)
              this.showDropdown = false
            }
          }, item.label)
        ])
      )
      )
    ])
  },
  props: {
    initVal: {
      type: Object,
      default () {
        return { label: '', value: null }
      }
    },
    items: {
      type: Array,
      default: []
    },
    right: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      filter: '',
      showDropdown: false,
      selectedItem: {}
    }
  },
  computed: {
    filteredItems () {
      return this.items.filter(item => item.label.includes(this.filter))
    }
  },
  watch: {
    'initVal' (n) {
      this.selectedItem = n
    }
  },
  mounted () {
    this.selectedItem = this.initVal
    document.addEventListener('keyup', this.onKeyup)
    document.addEventListener('click', this.onClick)
  },
  destroyed () {
    document.removeEventListener('keyup', this.onKeyup)
    document.removeEventListener('click', this.onClick)
  },
  methods: {
    onKeyup (evt) {
      if (evt.key === 'Escape') {
        this.showDropdown = false
      }
    },
    onClick (evt) {
      const composedPath = evt.composedPath()
      const isTarget = composedPath.includes(this.$el)
      if (!isTarget) {
        this.showDropdown = false
      }
    }
  }
}
