import '../assets/scss/globals.scss'
import Debug from 'debug'

const debug = Debug('nuxt-stories')

export default {
  render (h) {
    return h('div', {
      staticClass: 'nuxt-stories'
    }, [
      h('NuxtStoriesHeader'),
      h('NuxtStoriesContent')
    ])
  },
  data() {
    return {
      storiesInfo: {} // TBD: might want to use this...
    }
  },
  async mounted() {
    const { 
      ioOpts, 
      staticHost
    } = this.$config.nuxtStories
    const { lang } = this.$route.params
    
    let stories
    if (!staticHost) {
      await this.initIO(ioOpts)
      stories = await this.fetchStories(lang)
    } else {
      const db = await this.initDB()
      stories = db.buildTree(lang)     
    }
    
    debug('stories', stories)
    this.$store.commit('$nuxtStories/SET_STORIES', stories)
    this.$store.commit(
      '$nuxtStories/SET_ACTIVE_STORY',
      decodeURIComponent(this.$route.path)
    )  
    
  },
  methods: {
    async initDB() {
      const DB = (await import('../db.client.js')).default
      const db = DB({})
      await db.load()
      return db
    },
    async initIO(ioOpts = {}) {
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