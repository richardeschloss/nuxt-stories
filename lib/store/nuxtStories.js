import Vue from 'vue'
import { storeData } from '../utils/storage'

function resetStory (s, props) {
  props.forEach((prop) => {
    s[prop] = false
  })
  s.disabled = (s.rename || s.remove)
  s.to = (s.rename || s.remove)
    ? '#'
    : s.path

  if (s.children) {
    s.children.forEach(c => resetStory(c, props))
  }
}

function findStory ({ stories, idxs }) {
  if (!idxs) { return }
  return idxs
    .reduce((out, storyIdx, idx) => {
      if (!out) { return }
      out = (idx === 0)
        ? stories
        : out.children
      return out[storyIdx]
    }, {})
}

function findStoryByPath ({ stories, path }) {
  const parts = path.split('/')
  const startIdx = 3
  return parts
    .slice(startIdx)
    .reduce((out, part, idx) => {
      if (!out) { return }
      out = (idx === 0)
        ? stories
        : out.children

      const findPath = parts
        .slice(0, startIdx + idx + 1)
        .join('/')
      return out.find(entry => entry.path === findPath)
    }, {})
}

function newStoryCnt (arr) {
  let cnt = 0
  arr.forEach(({ name }) => {
    if (name.match('NewStory')) {
      cnt++
    }
  })
  return cnt
}

export const state = () => ({
  activeStory: {},
  stories: [],
  toc: [],
  viewModes: ['view', 'edit', 'split'],
  viewMode: 'view',
  lang: 'en',
  storiesDir: 'stories',
  fetched: {},
  components: {}, // TBD
  scripts: {}
})

export const mutations = {
  ADD_STORY ({ stories }, { idxs, story }) {
    const parent = findStory({ stories, idxs }) || {}
    if (!parent.children) {
      parent.children = []
    }
    const arr = (!parent.name)
      ? stories
      : parent.children

    arr.push(story)
  },

  REMOVE_STORY (state, { idxs }) {
    const lastIdx = idxs.length - 1
    const storyIdx = idxs[lastIdx]
    const parent = findStory({
      stories: state.stories,
      idxs: idxs.slice(0, lastIdx)
    })
    if (!parent.name) {
      state.stories = state.stories
        .filter((_, idx) => idx !== storyIdx)
    } else {
      parent.children = parent.children
        .filter((_, idx) => idx !== storyIdx)
    }
  },

  RENAME_STORY ({ stories }, { idxs, name, path, mdPath }) {
    const fnd = findStory({ stories, idxs })
    if (fnd) {
      const { name: oldName, path: oldPath } = fnd
      fnd.name = name
      fnd.path = path
      fnd.mdPath = mdPath
      if (fnd.children) {
        fnd.children.forEach((child) => {
          child.path = child.path.replace(`${oldPath}/`, `${path}/`)
          child.mdPath = child.mdPath.replace(`${oldPath.slice(1)}/`, `${path}/`.slice(1))
        })
      }
    }
  },

  SET_ACTIVE_STORY (state, path) {
    state.activeStory = findStoryByPath({ stories: state.stories, path })
    return state.activeStory
  },

  UPDATE_FRONTMATTER ({ activeStory }, frontMatter) {
    activeStory.frontMatter = frontMatter
  },

  SET_COMPONENTS ({ components }, { imported }) {
    Object.assign(components, imported)
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

  SET_STORY_DATA ({ stories }, { idxs, data, resetProps = Object.keys(data) }) {
    const fnd = findStory({ stories, idxs })
    if (fnd) {
      stories.forEach(s => resetStory(s, resetProps))
      Object.assign(fnd, data)
      if (data.rename ||
       data.remove) {
        fnd.to = ''
      }
    }
  },

  SET_STORIES (state, stories) {
    const props = [
      'hovered',
      'rename',
      'remove'
    ]
    stories.forEach(s => resetStory(s, props))
    state.stories = [ ...stories ]
  },

  SET_TOC (state, toc) {
    state.toc = [ ...toc ]
  },

  SET_VIEW_MODE (state, viewMode) {
    state.viewMode = state.viewModes.includes(viewMode)
      ? viewMode
      : state.viewModes[0]
  },

  SET_STORY_ORDER (state, { order, idxs }) {
    const { stories } = state
    const fnd = findStory({ stories, idxs })
    if (!fnd) {
      return
    }

    if (!fnd.frontMatter) {
      fnd.frontMatter = {}
    }
    Object.assign(fnd.frontMatter, { order })
  },

  SET_LANG (state, lang) {
    state.lang = lang
  },

  SET_STORIES_DIR (state, dir) {
    state.storiesDir = dir
  },

  SET_SCRIPT({ scripts }, alias) {
    scripts[alias] = window[alias]
  }
}

export const actions = {
  ADD ({ commit, state }, story = {}) {
    const { lang, storiesDir, stories } = state
    const parentStory = Object.assign({
      path: `/${storiesDir}/${lang}`,
      children: [],
      idxs: []
    }, story)

    const socket = window.$nuxt.$nuxtSocket({
      persist: 'storiesSocket',
      channel: ''
    })

    let idxs, newCnt
    if (parentStory.idxs.length > 0) {
      newCnt = newStoryCnt(parentStory.children)
      idxs = [
        ...parentStory.idxs,
        parentStory.children.length
      ]
    } else {
      newCnt = newStoryCnt(stories)
      idxs = [ stories.length ]
    }

    const name = `NewStory${newCnt}`
    const path = `${parentStory.path}/${name}`
    const mdPath = `${path.slice(1)}.md`
    const frontMatter = {}

    const newStory = {
      name,
      path,
      mdPath,
      idxs,
      frontMatter,
      children: [],
      to: path,
      hovered: false,
      rename: false,
      remove: false
    }

    socket.emit('addStory', newStory)
    commit('ADD_STORY', {
      story: newStory,
      idxs: parentStory.idxs
    })
  },

  RENAME ({ commit, state }, { story, newName }) {
    const socket = window.$nuxt.$nuxtSocket({
      persist: 'storiesSocket',
      channel: ''
    })
    const oldPath = story.mdPath
    const newPath = oldPath.replace(/\/[^/]+\.md/, `/${newName}.md`)
    const newRoute = '/' + newPath.replace('.md', '')
    socket.emit('renameStory', { oldPath, newPath })
    commit('RENAME_STORY', {
      idxs: story.idxs,
      name: newName,
      mdPath: newPath,
      path: newRoute
    })
    commit('SET_STORY_DATA', {
      idxs: story.idxs,
      data: {
        rename: false
      }
    })
    window.$nuxt.$router.push(newRoute)
  },

  REMOVE ({ commit, state }, story) {
    const socket = window.$nuxt.$nuxtSocket({
      persist: 'storiesSocket',
      channel: ''
    })
    socket.emit('removeStory', { path: story.mdPath })
    let nextRoute
    const pathParts = story.mdPath.split('/')
    if (story.idxs.length === 1) {
      nextRoute = '/' + pathParts[0]
    } else {
      nextRoute = '/' + pathParts.slice(0, pathParts.length - 1).join('/')
    }
    window.$nuxt.$router.push(nextRoute)
    commit('REMOVE_STORY', {
      idxs: story.idxs
    })
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
      socket.emit('fmFetch', info, resolve)
    })
  },

  FETCH_COMPONENTS ({ commit }, { components, origin, path }) {
    const imported = {}
    const queue = Object.entries(components)
      .reduce((obj, [k, c]) => {
        const v = Vue.component(k)
        if (!v) {
          imported[k] = {}
          obj[k] = c
        } else {
          const { _Ctor, ...rest } = v.extendOptions || {}
          imported[k] = rest
        }
        return obj
      }, {})
    commit('SET_COMPONENTS', { imported, path })
    if (Object.keys(queue).length === 0) return
    
    const socket = window.$nuxt.$nuxtSocket({
      persist: 'storiesSocket',
      channel: ''
    })
   
    socket.emit('fetchComponents', { components, origin }, () => {
      console.log('fetched comps')
    })
  },

  async FETCH_SCRIPTS({ commit }, { scripts }) {
    const aliases = {
      'lodash.js': '_'
    }
    
    Vue.prototype.$nsCache = {}
    const queue = scripts.reduce((arr, item) => {
      const parts = item.split('/')
      const scriptName = parts[parts.length-1]
      const alias = aliases[scriptName] || scriptName
      if (!window[alias]) {
        arr.push(item)
      } 
      console.log('set alias (1)', alias)
      Vue.prototype.$nsCache[alias] = window[alias] || {}
      commit('SET_SCRIPT', alias)
      return arr
    }, [])

    if (queue.length === 0) return
    
    function fetchScripts() {
      return new Promise(function(resolve) {
        window.$nuxt.$nuxtSocket({
          persist: 'storiesSocket',
          channel: ''
        }).emit('fetchScripts', {
          scripts: queue,
          origin: window.location.origin
        }, resolve)
      })
    }
    
    await fetchScripts() 
    queue.forEach((item) => {
      const parts = item.split('/')
      const scriptName = parts[parts.length-1]
      const script = document.createElement('script')
      script.src = `/nsCache/${scriptName}`
      const alias = aliases[scriptName] || scriptName
      document.getElementsByTagName('head')[0].appendChild(script)
      // delay
      Vue.set(Vue.prototype.$nsCache, alias, window[alias])
      // commit('SET_SCRIPT', alias)
      console.log('set for alias (2)', alias, Vue.prototype.$nsCache)
    })

    // ESM
    const modules = ['coffeescript', 'Example2'] // problems when module has external deps...
    modules.forEach((modName) => {
      // const modName = 'coffeescript'
      const module = document.createElement('script')
      module.text = `import ${modName} from "/nsImported/${modName}.js"\n`
        + `window.${modName} = ${modName}\n`
      module.type = 'module' 
      document.getElementsByTagName('head')[0].appendChild(module)
      Vue.prototype[modName] = window[modName] 
    })
    
    // commit('SET_SCRIPTS', { scripts: ['lodash.js'] })
  }
}

export default {
  state,
  mutations,
  actions
}
