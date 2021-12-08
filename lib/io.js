// import { readFileSync, existsSync, renameSync, rmdirSync, unlinkSync, mkdirSync as sync, readFile } from 'fs'
// import { resolve as pResolve, parse as pParse } from 'path'
// import Markdown from './utils/markdown.server.js'
import { register, db } from './module.js'
import FetchSvc from './utils/fetch.js'
import { fetchComponents } from './utils/autoImport.server.js'

// Let db handle most of this fs syncing...
// This should really be just glue
export default function (socket, io) {
  db.on('fileChanged', (info) => {
    socket.emit('fileChanged', info)
  })
  return Object.freeze({
    addStory(msg) {
      return db.addStory(msg)
    },
    fetchComponents,
    // fetchStory: ({ mdPath }) => Markdown.load(storyPath(mdPath)),
    fetchStories: register.stories,
    fmFetch: ({ notify, ...info }) => FetchSvc.fetch({
      ...info,
      notify (msg) {
        socket.emit('fmFetched', { path: info.path, ...msg })
      }
    }),
    fetchLangs: db.getLangs,
    removeStory (msg) {
      return db.removeStory(msg)
    },
    renameStory (msg) {
      return db.renameStory(msg)
    },
    updateContent(msg) {
      return db.updateContent(msg)
    },
    searchStories(query) {
      return db.search(query)
    }
  })
}
