export default {
  render (h) {
    return h('div', {
      staticClass: 'nuxt-stories'
    }, [
      h('LazyNuxtStoriesHeader'),
      h('LazyNuxtStoriesBody')
    ])
  },
  data () {
    return {
      storiesInfo: {}
    }
  },
  async mounted () {
    // Lazy load styles to improve server build time
    // @ts-ignore
    import('../assets/scss/globals.scss')
    const {
      db,
      ioOpts,
      staticHost
    } = this.$config.nuxtStories
    const { lang } = this.$route.params

    let stories
    if (!staticHost) {
      await this.initIO(ioOpts)
      stories = await this.fetchStories(lang)
    } else {
      stories = db.buildTree(lang)
    }

    this.$store.commit('$nuxtStories/SET_STORIES', stories)
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
