export default {
  render(h) {
    return h('NuxtStoriesDropdown', {
      attrs: {
        text: 'Lang',
        navItem: true,
        right: true,
        items: this.langs.map((lang) => {
          return {
            label: lang,
            value: `/stories/${lang}`
          }
        })
      },
      on: {
        itemSelected: (item) => {
          document.location.href = item.value
        }
      }
    })
  },
  data() {
    return {
      langs: []
    }
  },
  async mounted() {
    const { staticHost, db } = this.$config.nuxtStories
    if (staticHost) {
      this.langs = db.getLangs()
    } else {
      this.$nuxtSocket({
        persist: 'storiesSocket',
        namespaceCfg: {
          emitters: ['fetchLangs --> langs']
        }
      })
      this.fetchLangs()
    }
  }
}