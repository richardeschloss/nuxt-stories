import Vue from 'vue'
import { storeData } from '../utils/storage.js'

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

export const state = () => ({
  activeStory: {},
  stories: [],
  toc: [],
  viewModes: ['view', 'edit', 'split'],
  viewMode: 'view',
  lang: 'en',
  storiesDir: 'stories',
  fetched: {},
  esmsFetched: {}
})

export const mutations = {
  ESMS_FETCHED ({ esmsFetched }, { mods }) {
    Object.keys(esmsFetched).forEach((dest) => {
      delete Vue.prototype[dest]
      Vue.set(esmsFetched, dest, false)
    })

    Object.entries(mods).forEach(([dest, mod]) => {
      Vue.prototype[dest] = mod.default || mod
      if (Vue.prototype[dest].render) {
        Vue.component(dest, Vue.prototype[dest])
      }
      Vue.set(esmsFetched, dest, true)
    })
  },

  SET_ACTIVE_STORY (state, path) {
    state.activeStory = findStoryByPath({ stories: state.stories, path })
    return state.activeStory
  },

  UPDATE_FRONTMATTER ({ activeStory }, frontMatter) {
    activeStory.frontMatter = frontMatter
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
  }
}

export const actions = {
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

  FETCH_COMPONENTS (_, { items, origin }) {
    const imported = {}
    const queue = items
      .reduce((arr, entry) => {
        let alias, url
        if (typeof entry === 'string') {
          url = entry
          const parts = url.split('/')
          alias = parts[parts.length - 1].split('.')[0]
        } else {
          const [_alias, _url] = Object.entries(entry)[0]
          alias = _alias
          url = _url
        }

        const v = Vue.component(alias)
        if (!v) {
          arr.push([alias, url])
        } else {
          const { _Ctor, ...rest } = v.extendOptions
          imported[alias] = rest
        }
        return arr
      }, [])

    if (queue.length === 0) { return imported }

    return new Promise((resolve) => {
      window.$nuxt.$nuxtSocket({
        persist: 'storiesSocket',
        channel: ''
      }).emit('fetchComponents', { components: queue, origin }, () => resolve(imported))
    })
  },

  FETCH_ESMS (_, { items }) {
    const id = `nuxt-stories-esm`
    const commit = '$nuxtStories/ESMS_FETCHED'
    let module = document.getElementById(id)
    const mods = []
    const importStr = items
      .reduce((imports, item) => {
        let importStr
        if (typeof item === 'string') {
          const url = item
          const parts = url.split('/')
          const alias = parts[parts.length - 1].split('.')[0]
          importStr = `import * as ${alias} from "${url}"`
          mods.push(alias)
        } else {
          const [aliasesCSV, url] = Object.entries(item)[0]
          importStr = `import { ${aliasesCSV} } from "${url}"`
          aliasesCSV
            .split(/\s*,\s*/)
            .forEach((i) => {
              const [alias, dest] = i.split(/\s*as\s*/)
              mods.push(dest !== undefined ? dest : alias)
            }, [])
        }
        imports.push(importStr)
        return imports
      }, [])
      .join('\n')
    const cbStr =
      `window.$nuxt.$store.commit('${commit}', ` +
    `{ mods: { ${mods.join(', ')} }})\n` +
    `const elm = document.getElementById('${id}')\n` +
    `elm.modsImported({${mods.join(', ')}})\n`

    const modText = [
      importStr,
      cbStr
    ].join('\n')
    return new Promise((resolve) => {
      if (!module) {
        module = document.createElement('script')
        module.id = id
        module.type = 'module'
        module.text = modText
        module.modsImported = resolve
        document.head.appendChild(module)
      } else if (modText !== module.text) {
        const newMod = document.createElement('script')
        newMod.id = id
        newMod.type = 'module'
        newMod.text = modText
        newMod.modsImported = resolve
        module.replaceWith(newMod)
      } else {
        resolve({})
      }
    })
  },

  async FETCH_NPMS (_, { items }) {
    const p = items.map(async (entry) => {
      const [alias, npm] = typeof entry === 'string'
        ? [null, entry]
        : Object.entries(entry)[0]
      const [ name, versionIn ] = npm.split('@')
      const infoUrl = `https://data.jsdelivr.com/v1/package/npm/${name}`
      const { tags } = await fetch(infoUrl).then(res => res.json())
      const version = versionIn || tags.latest
      const detailUrl = `https://data.jsdelivr.com/v1/package/npm/${name}@${version}`
      const info = await fetch(detailUrl).then(res => res.json())
      return alias
        ? [alias, `https://cdn.jsdelivr.net/npm/${name}@${version}${info.default}`]
        : `https://cdn.jsdelivr.net/npm/${name}@${version}${info.default}`
    })
    return (await Promise.all(p))
      .reduce((arr, entry) => {
        arr.push(typeof entry === 'string'
          ? entry
          : ({ [entry[0]]: entry[1] })
        )
        return arr
      }, [])
  },

  FETCH_SCRIPTS (_, { items }) {
    const queue = items.reduce((arr, entry) => {
      let scriptName, url
      if (typeof entry === 'string') {
        url = entry
        const parts = url.split('/')
        scriptName = parts[parts.length - 1].split('.')[0]
      } else {
        const [alias, u] = Object.entries(entry)[0]
        scriptName = alias
        url = u
      }

      if (!window[scriptName]) {
        arr.push([scriptName, url])
      }
      return arr
    }, [])

    if (queue.length === 0) { return }
    return new Promise((resolve) => {
      let doneCnt = 0
      queue.forEach(async ([alias, url]) => {
        const script = document.createElement('script')
        script.id = `nuxt-stories-script-${alias}`
        script.onload = () => {
          Vue.prototype[alias] = window[alias]
          if (++doneCnt === queue.length) {
            resolve()
          }
        }
        script.src = url
        document.head.appendChild(script)
      })
    })
  }
}