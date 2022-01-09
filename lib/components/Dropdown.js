import { h } from 'vue'
export default {
  render () {
    return h('div', {
      class: 'dropdown' + (this.navItem ? ' nav-item' : '')
    }, [
      h(this.navItem ? 'a' : 'button', {
        ...Object.assign({},
          this.navItem
            ? { href: '#' }
            : {}
        ),
        class: 'dropdown-toggle' + (this.navItem ? ' nav-link' : ' btn btn-secondary'),
        onClick: (evt) => {
          evt.preventDefault()
          this.showDropdown = !this.showDropdown
        }
      }, this.text),
      h('ul', {
        class: 'dropdown-menu' +
          (this.showDropdown ? ' show' : '') +
          (this.right ? ' right' : '')
      },
      this.items.map(item =>
        h('li', [
          h('a', {
            class: 'dropdown-item',
            href: '#',
            onClick: (evt) => {
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
    items: {
      type: Array,
      default: []
    },
    text: {
      type: String,
      default: 'Dropdown button'
    },
    navItem: {
      type: Boolean,
      default: false
    },
    right: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      showDropdown: false
    }
  },
  mounted () {
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
      const isTarget = composedPath.includes(this.$el) // 'div.dropdown')
      if (!isTarget) {
        this.showDropdown = false
      }
    }
  }
}
