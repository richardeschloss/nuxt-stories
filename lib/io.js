import { register, db } from './module.js'
import FetchSvc from './utils/fetch.js'
import { fetchComponents } from './utils/autoImport.server.js'
import { runTest } from './utils/testRunner.js'

export default function (socket, io) {
  db.on('fileChanged', (info) => {
    socket.emit('fileChanged', info)
  })
  return Object.freeze({
    addStory (msg) {
      return db.addStory(msg)
    },
    fetchComponents,
    fetchStory: db.loadStory,
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
    updateContent (msg) {
      return db.updateContent(msg)
    },
    searchStories (query) {
      return db.search(query)
    },
    async runTests (testFile) {
      console.log('runTests...', testFile)
      if (!T.loaded(testFile)) {
        await T.load(testFile)
      }
      return await T.run((info) => {
        socket.emit('nuxtStoriesTestResult', info)
      })
    },
    // TBD: tie in test APIs?
    // This may or may not be such a great idea after all. :/
    runTest
  })
}
