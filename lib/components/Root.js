import { h } from 'vue'
import '../assets/scss/globals.scss'
import Body from './Body.js'
import Header from './Header.js'
export default {
  render () {
    return h('div', {
      class: 'nuxt-stories'
    }, [
      h(Header),
      h(Body)
    ])
  },
  data () {
    return {
      storiesInfo: {}
    }
  },
  async mounted () {
    const {
      db,
      ioOpts,
      staticHost
    } = this.$config.nuxtStories
    const { lang = 'en' } = this.$route.params

    let stories
    if (!staticHost) {
      await this.initIO(ioOpts)
      stories = await this.fetchStories(lang)
    } else {
      let useDb = db
      if (!useDb) {
        const { register } = await import('../plugin.js')
        useDb = await register.db()
      }
      stories = useDb.buildTree(lang)
    }
    this.$nuxtStories().value.stories = stories
  },
  methods: {
    async initIO (ioOpts = {}) {
      // @ts-ignore
      const { reconnection = false, emitTimeout = 1000 } = ioOpts

      this.socket = this.$nuxtSocket({
        name: 'nuxtStories',
        persist: 'storiesSocket',
        channel: '',
        reconnection,
        emitTimeout,
        namespaceCfg: {
          emitters: ['fetchStories --> storiesInfo']
        },
        vuex: {
          mutations: ['fileChanged --> $nuxtStories/SET_STORIES']
        }
      })
      await this.socket.onceP('connect')
    }
  }
}
