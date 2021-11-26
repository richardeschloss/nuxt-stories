import '../assets/scss/globals.scss'

export default {
  render (h) {
    return h('div', {
      staticClass: 'nuxt-stories'
    }, [
      h('NuxtStoriesHeader')
    ])
  },
  mounted() {
    const { 
      ioOpts, 
      storiesDir, 
      lang, 
      staticHost 
    } = this.$config.nuxtStories
    if (!staticHost) {
      this.initIO({ ioOpts, storiesDir, lang })
    } else {
      this.fetchStaticStories({ lang, staticHost })
    }  
  },
  methods: {
    async fetchStaticStories({ lang, staticHost }) {
      const { mount = '/markdown', url } = staticHost
      const fetchUrl = url || `${mount}/stories.json`
      const stories = await fetch(fetchUrl)
        .then(res => res.json())
        .catch(console.error)
      
      this.$store.commit('$nuxtStories/SET_STORIES', stories[lang])
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
          emitters: ['fetchStories']
        }
      })
      await this.socket.onceP('connect')
      const { stories } = await this.fetchStories({
        lang,
        storiesDir
      }).catch(console.error)
      this.$store.commit('$nuxtStories/SET_STORIES', stories)
      this.$store.commit(
        '$nuxtStories/SET_ACTIVE_STORY',
        decodeURIComponent(window.$nuxt.$route.path)
      )
    }  
  }
}