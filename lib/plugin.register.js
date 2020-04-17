import Vue from 'vue'
import VueDist from 'vue/dist/vue.common.js'
import Markdown from './utils/markdown.client'
import { BootstrapVueIcons } from 'bootstrap-vue'
import { autoImport } from './utils/autoImport'

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function storyNode(node, basePath) {
  const { name, path, children, meta } = node
  const out = {
    name: name.split('-').slice(-1)[0],
    path: `${basePath}/${path}`
  }
  if (meta) {
    out.frontMatter = meta.frontMatter
  }
  if (children) {
    out.children = children.map((c) => storyNode(c, out.path))
  }
  out.path = `/${out.path}`
  return out
}

export const register = Object.freeze({
  components() {
    // This works (tested manually), it's just a pain to write automated tests for.
    /* istanbul ignore next */
    autoImport.components(require.context('./components', true, /\.(vue|js)$/))
    /* istanbul ignore next */
    autoImport.components(require.context('@/components', true, /\.(vue|js)$/))
  },
  icons() {
    Vue.use(BootstrapVueIcons)
  },
  stories(store, router, routeRoot) {
    const storyRoutes = router.options.routes.find(
      ({ name }) => name === routeRoot
    )
    const stories =
      storyRoutes && storyRoutes.children
        ? storyRoutes.children.map((c) => storyNode(c, routeRoot))
        : []
    store.commit('$nuxtStories/SET_STORIES', stories)
  },
  vuexModule(store) {
    store.registerModule(
      '$nuxtStories',
      {
        namespaced: true,
        state: {
          stories: [],
          toc: [],
          viewModes: ['view', 'edit', 'split'],
          viewMode: 'view'
        },
        mutations: {
          SET_STORIES(state, stories) {
            Vue.set(state, 'stories', [...stories])
          },

          SET_TOC(state, toc) {
            Vue.set(state, 'toc', [...toc])
          },

          SET_VIEW_MODE(state, viewMode) {
            state.viewMode = state.viewModes.includes(viewMode)
              ? viewMode
              : state.viewModes[0]
          },

          SET_STORY_ORDER(state, info) {
            const { stories } = state
            const { idxs, order } = info
            let fnd
            idxs.forEach((storyIdx, idx) => {
              if (idx === 0) {
                fnd = stories[storyIdx]
              } else {
                fnd = fnd.children[storyIdx]
              }
            })
            if (!fnd.frontMatter) {
              fnd.frontMatter = {}
            }
            Object.assign(fnd.frontMatter, { order })
          }
        }
      },
      { preserveState: false }
    )
  },
  watchers(ctx) {
    ctx.$watch('$route.meta.mdPath', function(n) {
      ctx.updateStory()
    })
    
    ctx.$watch('storiesData.frontMatter.order', function(n) {
      if (n) {
        ctx.$store.commit('$nuxtStories/SET_STORY_ORDER', {
          idxs: ctx.$route.meta.idxs,
          order: n
        })
      }
    })
  }
})

export const methods = Object.freeze({
  $destroy() {
    this.$store.commit('$nuxtStories/SET_TOC', [])
    this.componentDestroy()
  },
  async compileContents(debounceMs = 300) {
    await delay(debounceMs)
    this.compileVue()
  },
  compileInnerHTML(el, binding, { context }) {
    const input = el.innerHTML.replace(/ {2}/g, '')
    const { compiled } = Markdown.parse(input)
    context.compiled = compiled
  },
  compileVue() {
    this.storiesData.mdPath = this.$route.meta.mdSavePath
    const { toc, compiled, frontMatter } = Markdown.parse(this.storiesData.contents)
    this.$set(this.storiesData, 'frontMatter', frontMatter)
    const res = VueDist.compile(`<div>${compiled}</div>`)
    const compiledVue = {
      data() {
        return { ...frontMatter }
      },
      render: res.render,
      staticRenderFns: res.staticRenderFns
    }
    this.$set(this.storiesData, 'compiled', compiledVue)
    this.$store.commit('$nuxtStories/SET_TOC', toc)
    this.saveMarkdown()
  },
  async updateStory() {
    const contents = await fetch(`/${this.$route.meta.mdPath}`)
      .then((res) => res.text())
      .catch(console.error)
    this.$set(this.storiesData, 'contents', contents)
    this.compileVue()
  }
})

export const directives = Object.freeze({
  markdown: {
    componentUpdated: methods.compileInnerHTML,
    inserted: methods.compileInnerHTML
  }
})