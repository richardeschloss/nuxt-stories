import Vue from 'vue'
import { storeData } from '../utils/storage.js'

export const state = () => ({
  toc: [],
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

  SET_TOC (state, toc) {
    state.toc = [...toc]
  }
}

export const actions = {

  FETCH ({ commit }, info) {
    const socket = window.$nuxt.$nuxtSocket({
      name: 'nuxtStories',
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
