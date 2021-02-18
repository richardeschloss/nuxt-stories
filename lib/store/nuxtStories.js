import Vue from 'vue'
import { storeData } from '../utils/storage'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))
const fetchContents = (url) => fetch(url).then(res => res.text())

// TBD:
// function fetchScripts() {
//   return new Promise(function(resolve) {
//     window.$nuxt.$nuxtSocket({
//       persist: 'storiesSocket',
//       channel: ''
//     }).emit('fetchScripts', {
//       scripts: queue,
//       origin: window.location.origin
//     }, resolve)
//   })
// }

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
  scripts: {},
  esms: {}, // TBD
  esmsQueue: {} // []
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

  ESM_FETCHED({ esmsQueue }, { aliases, mods, path, dest }) {
    aliases.forEach((alias, idx) => {
      const mod = mods[idx].default || mods[idx]
      const qEntry = esmsQueue[path][alias]
      Vue.set(qEntry, 'fetched', !!mod)
      Vue.prototype[dest] = mod
      console.log('save to', alias, dest)
    })
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

  SET_ESMS_QUEUE({ esmsQueue }, { path, queue }) {
    if (!esmsQueue[path]) {
      Vue.set(esmsQueue, path, {})
    }
    Vue.set(esmsQueue, path, queue)
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

const scriptStr = ({ 
  importAs, 
  aliasStr,
  aliases, 
  url,
  path,
  dest,
  commit,
}) => {
  const templates = {
    allAsAlias: `import * as ${aliasStr} from "${url}"\n`,
    aliasCSV: `import { ${aliasStr} } from "${url}"\n`
  }
  const commitMsg = JSON.stringify({
    path, 
    aliases,
    dest, 
    url 
  })
  return templates[importAs] +
    `window.$nuxt.$store.commit('${commit}', `
    + `{ mods: [${aliasStr}], ...${commitMsg} })\n`
}

const buildQueue = (arrIn = [], cacheObj = {}, queued = {}) => {
  return arrIn.reduce((queue, entry) => {
    let aliases = [], url, dests = []
    if (typeof entry === 'string') {
      url = entry
      const parts = url.split('/')
      aliases = [parts[parts.length-1].split('.')[0]]
      dests = [...aliases]
    } else {
      const [_alias, _url] = Object.entries(entry)[0]
      url = _url
      _alias
        .split(/\s*,\s*/)
        .forEach((i) => {
          const [alias, dest] = i.split(/\s*as\s*/)
          aliases.push(alias)
          dests.push(dest || alias)
        }, [])
    }
    
    aliases.forEach((alias, idx) => {
      if (!cacheObj[alias] || !queued[alias] || queued[alias].url !== url) {
        queue[alias] = { url, entryType: typeof entry, dest: dests[idx] }
      }
    })
    return queue
  }, {})
}

function injectImporter(items, cacheObj) {
  console.log('inject', items)
  const imports = []
  // mod text = '...'
  items.forEach((item) => {
    let aliases, dests, url, importStr
    if (typeof item === 'string') {
      url = item
      const parts = url.split('/')
      aliases = [parts[parts.length-1].split('.')[0]]
      dests = [aliases]
      // if (!cacheObj[dests[0]]) {
      importStr = `import * as ${aliases[0]} from ${url}`
      // } else {
      //   console.log('already cached', cacheObj[dests[0]])
      // }
    } else {
      const [aliasesCSV, _url] = Object.entries(item)[0]
      url = _url
      importStr = `import { ${aliasesCSV} } from ${url}`
      
      // aliasesCSV
      //   .split(/\s*,\s*/)
      //   .forEach((i) => {
      //     const [alias, dest] = i.split(/\s*as\s*/)
      //     aliases.push(alias)
      //     dests.push(dest || alias)
      //   }, [])
    }
    imports.push(importStr)
    // console.log('alias, dest', alias, dest)
    // console.log('importStr', importStr) 
  })
  console.log('imports\n', imports.join('\n'))
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

  FETCH_ESMS ({ state, commit }, { items, path }) {
    injectImporter(items, Vue.prototype)
    const queueObj = buildQueue(items, Vue.prototype, state.esmsQueue[path])
    const queue = Object.entries(queueObj)
    
    if (queue.length === 0) return
    
    // console.log('queue', queue)
    return
    commit('SET_ESMS_QUEUE', { path, queue: queueObj })
    
    queue.forEach(async ([aliasStr, { url, entryType, dest }]) => { 
      let importAs, aliases
      const module = document.createElement('script')  // get or create   
      module.id = `nuxt-stories-esm-${path}`
      module.type = 'module'
      if (entryType === 'string') {
        importAs = 'allAsAlias'
        aliases = [aliasStr]
      } else {
        importAs = 'aliasCSV'
        aliases = aliasStr.split(/,\s*/)
      }
      module.text = scriptStr({
        importAs,
        aliasStr,
        aliases,
        url,
        path,
        dest,
        commit: '$nuxtStories/ESM_FETCHED'  
      })
      console.log('mod text', module.text)
      document.getElementsByTagName('head')[0].appendChild(module)
    })
  },

  async FETCH_SCRIPTS({ commit }, { scripts, path }) {
    const queue = scripts.reduce((arr, entry) => {
      let scriptName, url
      if (typeof entry === 'string') {
        url = entry
        const parts = url.split('/')
        scriptName = parts[parts.length-1].split('.')[0]
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

    if (queue.length === 0) return
    if (!window.scriptFetched) {
      window.scriptFetched = {}
    }
    return new Promise(resolve => {
      window.scriptFetched[path] = (alias) => {
        Vue.prototype[alias] = window[alias]
        let allFetched = true
        queue.forEach(([a]) => {
          allFetched = allFetched && !!window[a]
        })
        if (allFetched) {
          resolve()
        }
      }
      queue.forEach(async ([alias, url]) => { 
        // TBD: get existing by id? or create? (hmm, already have the queue check)
        const script = document.createElement('script')
        script.text = await fetchContents(url)
          + `;window.scriptFetched["${path}"]("${alias}")\n`
        document.getElementsByTagName('head')[0].appendChild(script)
      })
    })
  },

  async FETCH_NPMS ({}, { npms, path }) {
    // check queue here...
    const p = npms.map(async (entry) => {
      const [alias, npm] = typeof entry === 'string'
        ? [null, entry]
        : Object.entries(entry)[0]
      const [ name, versionIn ] = npm.split('@') 
      const infoUrl = `https://data.jsdelivr.com/v1/package/npm/${name}`
      const { tags } = await fetch(infoUrl).then(res => res.json())
      const version = versionIn || tags.latest
      const detailUrl = `https://data.jsdelivr.com/v1/package/npm/${name}@${version}`
      const info =  await fetch(detailUrl).then(res => res.json())
      return alias 
        ? [alias, `https://cdn.jsdelivr.net/npm/${name}@${version}${info.default}`]
        : `https://cdn.jsdelivr.net/npm/${name}@${version}${info.default}`
    })
    const esms = (await Promise.all(p))
      .reduce((arr, entry) => {
        arr.push(typeof entry === 'string'
          ? entry
          : ({[entry[0]]: entry[1]})
        )
        return arr  
      }, [])
    
    return actions.FETCH_ESMS({}, {
      esms,
      path
    })
  },

  FETCH_VUES ({}, { vues, path }) {
    const queue = vues.reduce((arr, entry) => {
      let scriptName, url
      if (typeof entry === 'string') {
        url = entry
        const parts = url.split('/')
        scriptName = parts[parts.length-1].split('.')[0]
      } else {
        const [alias, u] = Object.entries(entry)[0]
        scriptName = alias
        url = u
      }
      
      if (!Vue.prototype[scriptName]) {
        arr.push([scriptName, url, typeof entry])
      }
      return arr
    }, [])

    if (queue.length === 0) return

    if (!window.vueFetched) {
      window.vueFetched = {}
    }
    return new Promise(resolve => {
      // TBD...scoping? to context?
      window.vueFetched[path] = function (modName, mod) {
        let allFetched = true
        Vue.component(modName, mod)

        queue.forEach(([a]) => {
          allFetched = allFetched && !!Vue.component(modName)
        })

        if (allFetched) {
          resolve()
        }
      }
      
      queue.forEach(async ([alias, url, entryType]) => { 
        const module = document.createElement('script')
        module.type = 'module'        
        module.text = `import ${alias} from "${url}"\n`
          + `window.vueFetched["${path}"]("${alias}", ${alias})`
          
        document.getElementsByTagName('head')[0].appendChild(module)
      })
    })   
  }
}

export default {
  state,
  mutations,
  actions
}
