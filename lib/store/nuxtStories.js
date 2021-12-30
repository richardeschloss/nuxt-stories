import Vue from 'vue'
import { storeData } from '../utils/storage.js'

export const state = () => ({
  activeStory: null,
  stories: [],
  toc: [],
  viewModes: ['view', 'edit', 'split'],
  viewMode: '',
  fetched: {}
})

export const mutations = {
  SET_ACTIVE_STORY (state, story) {
    state.activeStory = story
  },

  SET_FETCHED ({ fetched, activeStory }, { path, key, resp }) {
    if (!fetched[path]) {
      Vue.set(fetched, path, {})
    }
    if (key === undefined) {
      Vue.set(fetched, path, resp)
    } else {
      Vue.set(fetched[path], key, resp)
    }

    if (activeStory.frontMatter) {
      const { fetch: f = [], nodeFetch: nF = [] } = activeStory.frontMatter
      const fetchProps = [...Object.keys(f), ...Object.keys(nF)]
      const storedProps = Object.keys(fetched[path])
      storedProps.forEach((p) => {
        if (!fetchProps.includes(p)) {
          delete fetched[path][p]
        }
      })
    }
  },

  SET_STORIES (state, stories) {
    state.stories = stories
  },

  SET_TOC (state, toc) {
    state.toc = [...toc]
  },

  SET_VIEW_MODE (state, viewMode) {
    state.viewMode = state.viewModes.includes(viewMode)
      ? viewMode
      : state.viewModes[0]
    localStorage.setItem('nuxtStoriesViewMode', state.viewMode)
  }
}

export const actions = {
  async FETCH_STORY ({ commit }, href) {
    const socket = window.$nuxt.$nuxtSocket({
      // @ts-ignore
      persist: 'storiesSocket',
      channel: ''
    })
    // @ts-ignore
    const story = await socket.emitP('fetchStory', href)
    commit('SET_ACTIVE_STORY', story)
  },

  FETCH ({ commit }, info) {
    const socket = window.$nuxt.$nuxtSocket({
      persist: 'storiesSocket',
      channel: ''
    })

    if (socket.listeners('fmFetched').length === 0) {
      socket.on('fmFetched', function ({ path, key, resp, dest }) {
        commit('SET_FETCHED', { path, key, resp })
        if (dest) {
          storeData(dest, { item: 'fetched', path, key, data: resp })
        }
      })
    }
    return new Promise((resolve) => {
      socket.emit('fmFetch', info, resolve) // TBD: await socket.emitP('fmFetch', info)
    })
  }
}
