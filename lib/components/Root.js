import '../assets/scss/globals.scss'

export default {
  render (h) {
    return h('div', {
      staticClass: 'nuxt-stories'
    }, [
      h('NuxtStoriesHeader'),
      h('div', ['Story changed: ==> ' + this.fileChanged]) // TBD
    ])
  },
  data() {
    return {
      fileChanged: ''
    }
  },
  async mounted() {
    const { 
      ioOpts, 
      storiesDir, 
      lang, 
      staticHost 
    } = this.$config.nuxtStories
    let stories
    if (!staticHost) {
      await this.initIO({ ioOpts, storiesDir, lang })
      stories = await this.fetchStories(lang).catch(console.error)
    } else {
      const db = await this.initDB({ lang, staticHost })
      stories = db.buildTree(lang)     
    }
    console.log('stories', stories)
    this.$store.commit(
      '$nuxtStories/SET_ACTIVE_STORY',
      decodeURIComponent(window.$nuxt.$route.path)
    )  
  },
  methods: {
    async initDB({ lang, staticHost }) {
      const DB = (await import('../db.client.js')).default
      const db = DB({})
      await db.load()
      return db
    },
    async initIO({ ioOpts = {}, storiesDir, lang }) {
      // @ts-ignore
      const { reconnection = false, emitTimeout = 1000 } = ioOpts

      this.socket = this.$nuxtSocket({
        name: 'nuxtStories',
        persist: 'storiesSocket',
        channel: '',
        reconnection,
        emitTimeout,
        namespaceCfg: {
          emitters: ['fetchStories'],
          listeners: ['fileChanged']
        }
      })
      await this.socket.onceP('connect')
    }  
  }
}