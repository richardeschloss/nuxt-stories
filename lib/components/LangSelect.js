import { h } from 'vue'
import Dropdown from './Dropdown.js'
export default {
  render () {
    return h(Dropdown, {
      text: 'Lang',
      navItem: true,
      right: true,
      items: this.langs.map((lang) => {
        return {
          label: lang,
          value: `/stories/${lang}`
        }
      }),
      onItemSelected: (item) => {
        this.$router.push(item.value)
      }
    })
  },
  data () {
    return {
      langs: []
    }
  },
  async mounted () {
    const { staticHost, db } = this.$config.nuxtStories
    if (staticHost) {
      let useDb = db
      if (!useDb) {
        const { register } = await import('../plugin.js')
        useDb = await register.db()
      }
      this.langs = useDb.getLangs()
    } else {
      this.$nuxtSocket({
        name: 'nuxtStories',
        persist: 'storiesSocket',
        namespaceCfg: {
          emitters: ['fetchLangs --> langs']
        }
      })
      this.fetchLangs()
    }
  }
}
