import { h } from 'vue'
export default {
  render () {
    const { NuxtStoriesHeader, NuxtStoriesSideNav, NuxtStoriesMain } = this.$.appContext.components
    return this.showStories
      ? h('div', {
        class: 'nuxt-stories'
      }, [
        h(NuxtStoriesHeader),
        h('div', {
          class: 'container-xxl my-md-2 bd-layout',
          ref: 'NuxtStoriesBody'
        }, [
          h(NuxtStoriesSideNav),
          h(NuxtStoriesMain)
        ])
      ])
      : null
  },
  data () {
    return {
      storiesInfo: {},
      socket: null,
      showStories: true
    }
  },
  watch: {
    '$route.params.lang' (n) {
      if (n) {
        this.loadStories()
      } else {
        this.showStories = false
      }
    }
  },
  mounted () {
    this.loadStories()
    this.observeSidebar()
  },
  methods: {
    initIO (ioOpts = {}) {
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
      this.socket.on('fileChanged', ({ stories, changed }) => {
        this.$nuxtStories().value.stories = stories
        this.$nuxtStories().value.activeStory = changed
      })
    },
    async loadStories () {
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
    observeSidebar () {
      const sidebarWidth = parseFloat(window.getComputedStyle(this.$refs.NuxtStoriesBody.children[0]).width)
      // @ts-ignore
      new ResizeObserver((entries) => {
        if (entries[0].contentRect.width < sidebarWidth) {
          if (this.$refs.NuxtStoriesBody?.children[1]) {
            // it's only truthy if we have an active story...
            this.$refs.NuxtStoriesBody.children[1].style['margin-left'] = `${entries[0].contentRect.width - sidebarWidth}px`
          }
        }
      }).observe(this.$refs.NuxtStoriesBody.children[0])
    }
  }
}
