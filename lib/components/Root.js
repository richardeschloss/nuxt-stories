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
      lang: langDefault,
      storiesAnchor,
      staticHost
    } = this.$config.nuxtStories
    const { lang } = this.$route.params
    if (this.$route.path === `/${storiesAnchor}` || lang === undefined) {
      this.$router.push(`/${storiesAnchor}/${langDefault}/`)
    }

    let stories
    if (!staticHost) {
      await this.initIO(ioOpts)
      stories = await this.fetchStories(lang)
    } else {
      stories = db.buildTree(lang)
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
        }
      })
      await this.socket.onceP('connect')
      this.socket.on('fileChanged', ({ stories, changed }) => {
        this.$nuxtStories().value.stories = stories
        this.$nuxtStories().value.activeStory = changed
      })
    }
  }
}
