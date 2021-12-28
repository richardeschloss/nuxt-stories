import { register, db } from './module.js'
import FetchSvc from './utils/fetch.js'
import { fetchComponents } from './utils/autoImport.server.js'
import { runTest } from './utils/testRunner.js'

export default function (socket, io) {
  db.on('fileChanged', (info) => {
    socket.emit('fileChanged', info)
  })
  return Object.freeze({
    addStory: db.addStory,
    fetchStory: db.loadStory,
    removeStory: db.removeStory,
    renameStory: db.renameStory,
    updateContent: db.updateContent,
    searchStories: db.search,
    fetchLangs: db.getLangs,
    fetchComponents, // TBD
    fetchStories: register.stories,
    fmFetch: info => FetchSvc.fetch({
      ...info,
      notify (msg) {
        socket.emit('fmFetched', { path: info.path, ...msg })
      }
    }),
    runTest
  })
}
