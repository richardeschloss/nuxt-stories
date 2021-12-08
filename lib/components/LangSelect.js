export default {
  render(h) {
    const langElms = this.langs.map((lang) => {
      return h('li', {  
      }, [
        h('a', {
          staticClass: 'dropdown-item',
          attrs: {
            href: `/stories/${lang}`
          }
        }, lang)
      ])
    })
    const topText = h('a', {
      staticClass: 'nav-link dropdown-toggle',
      attrs: {
        href: '#',
        'data-bs-toggle': "dropdown",
      }
    }, 'Lang')

    const dropdown = h('ul', {
      staticClass: 'dropdown-menu dropdown-menu-end',
    }, langElms)
    return h('div', {
      staticClass: 'nav-item dropdown'
    }, [
      topText,
      dropdown
    ])
  },
  data() {
    return {
      langs: []
    }
  },
  async mounted() {
    this.$nuxtSocket({
      persist: 'storiesSocket',
      namespaceCfg: {
        emitters: ['fetchLangs --> langs']
      }
    })
    this.fetchLangs()
  }
}