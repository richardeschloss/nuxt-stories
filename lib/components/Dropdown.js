export default {
  render (h) {
    return h('div', {
      staticClass: 'dropdown',
      class: {
        'nav-item': this.navItem
      }
    }, [
      h(this.navItem ? 'a' : 'button', {
        attrs: Object.assign({},
          this.navItem
            ? { href: '#' }
            : {}
        ),
        staticClass: 'dropdown-toggle',
        class: {
          'nav-link': this.navItem,
          'btn btn-secondary': !this.navItem
        },
        on: {
          click: (evt) => {
            evt.preventDefault()
            this.showDropdown = !this.showDropdown
          }
        }
      }, this.text),
      h('ul', {
        staticClass: 'dropdown-menu',
        class: {
          show: this.showDropdown,
          right: this.right
        }
      },
      this.items.map(item =>
        h('li', [
          h('a', {
            staticClass: 'dropdown-item',
            attrs: {
              href: '#'
            },
            on: {
              click: (evt) => {
                this.$emit('itemSelected', item)
                this.showDropdown = false
              }
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
