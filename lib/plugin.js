/* eslint-disable no-console */
import Debug from 'debug'
import Vue from 'vue/dist/vue.common.js' // Nuxt 2.x needs the commonjs version (otherwise you'd have to transpile it)
import { delay } from 'les-utils/utils/promise.js'
import Markdown from './utils/markdown.js'
import { state, mutations, actions } from './store/nuxtStories.js'
import StoryFactory from './utils/storyFactory.js'

const debug = Debug('nuxt-stories')

Object.assign(Vue.config, {
  /* TBD: error handling (issue/69) */
  // For example, can by thrown by: {{ $route }},
  // which can be likely, if someone intends to type "{{ $route.path }}"
  errorHandler (err, vm, info) {
    console.log('ERROR', err.message, vm, info)
    if (info === 'render') {
      // We re-throw the error again so that the page still stays alive,
      // but the user sees the error message in the dev console.
      // Otherwise, the page would just keep on crashing without a graceful means to exit.
      throw new Error(err)
    }
  },
  warnHandler (err, vm, info) {
    // Mute VueJsonPretty warnings (especially for json with functions)
    if (info.includes('VueJsonPretty')) { return }
    console.warn(err, vm, info)
  }  
})

let pOptions

export const register = Object.freeze({
  storyIO (ctx) {
    const { ioOpts = {}, staticHost } = pOptions
    if (staticHost) {
      return
    }
    const { reconnection = false, emitTimeout = 5000 } = ioOpts
    ctx.socket = ctx.$nuxtSocket({
      name: 'nuxtStories',
      channel: '',
      reconnection,
      emitTimeout,
      namespaceCfg: {
        emitters: [
          'fetchStory',
          'saveMarkdown + storiesData'
        ]
      }
    })
  },
  watchers (ctx) {
    ctx.$watch('$route.path', function (n) {
      ctx.$store.commit('$nuxtStories/SET_ACTIVE_STORY', decodeURIComponent(n))
      ctx.updateStory()
    })

    ctx.$watch('storiesData.frontMatter.order', function (n) {
      if (n) {
        const { activeStory } = ctx.$store.state.$nuxtStories
        ctx.$store.commit('$nuxtStories/SET_STORY_ORDER',
          {
            order: n,
            idxs: activeStory.idxs
          })
      }
    })
  }
})

export const methods = Object.freeze({
  $destroy () {
    this.$store.commit('$nuxtStories/SET_TOC', [])
    this.componentDestroy()
  },
  async compileContents (debounceMs = 300) {
    await delay(debounceMs)
    this.compileVue()
  },
  compileInnerHTML (el, binding, { context }) {
    const input = el.innerHTML.replace(/ {2}/g, '')
    const { compiled } = Markdown.parse(input)
    context.compiled = compiled
  },
  compileVue () {
    const { toc, compiled, frontMatter } = Markdown.parse(this.storiesData.contents)
    this.$store.commit('$nuxtStories/UPDATE_FRONTMATTER', frontMatter)
    this.$store.commit('$nuxtStories/SET_TOC', toc)
    this.$set(this.storiesData, 'frontMatter', frontMatter)
    if (this.viewMode !== 'edit') {
      const res = VueDist.compile(`<div>${compiled}</div>`)
      const compiledVue = StoryFactory({ cfg: pOptions, frontMatter, ...res })
      this.$set(this.storiesData, 'compiled', compiledVue)
    }

    if (!pOptions.staticHost) {
      this.$set(this.storiesData, 'mdPath', `${decodeURIComponent(this.$route.path)}.md`)
      this.saveMarkdown().catch(console.error)
    }
  },
  async updateStory () {
    const { storiesDir, staticHost } = pOptions
    const { lang } = this.$route.params
    if (!lang) { return }
    let contents
    if (staticHost) {
      const { mount = '/markdown' } = staticHost
      const relPath = this.$route.path.replace(`/${storiesDir}`, mount)
      const mdPath = `${relPath}.md`.replace('/.md', '.md')
      contents = await fetch(mdPath)
        .then(res => res.text())
        .catch(console.error)
    } else {
      contents = await this.fetchStory({
        mdPath: `${decodeURIComponent(this.$route.path)}.md`
      }).catch(console.error)
    }

    if (contents) {
      this.$set(this.storiesData, 'contents', contents)
      this.compileVue()
    }
  }
})

export const directives = Object.freeze({
  markdown: {
    componentUpdated: methods.compileInnerHTML,
    inserted: methods.compileInnerHTML
  }
})

function nuxtStories() {
  this.componentDestroy = this.$destroy
  register.storyIO(this)
  Object.assign(this, { ...methods })
  register.watchers(this)
  this.updateStory()
}

export default function({ $config, store, app }, inject) {
  pOptions = $config.nuxtStories  
  const { lang, storiesDir, storiesAnchor } = $config.nuxtStories
  app.router.beforeEach((to, from, next) => {
    if (!to.params.lang) {
      const pathParts = to.path.slice(1).split('/')
      if (pathParts.length === 1) {
        // Use default language
        app.router.push(`/${storiesAnchor}/${lang}`)
      } else if (pathParts.length === 2) {
        // Just append '/'
        app.router.push(to.path + '/')
      }
    }
    next()
  })
  store.registerModule(
    '$nuxtStories',
    {
      namespaced: true,
      state: state(),
      mutations,
      actions
    }
  )
  store.commit('$nuxtStories/SET_LANG', lang)
  store.commit('$nuxtStories/SET_STORIES_DIR', storiesDir)
  inject('nuxtStories', nuxtStories)
}
