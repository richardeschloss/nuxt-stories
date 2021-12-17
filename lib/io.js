import { register, db } from './module.js'
import FetchSvc from './utils/fetch.js'
import { fetchComponents } from './utils/autoImport.server.js'
import TestUtils from './utils/test.js'

export default function (socket, io) {
  const T = TestUtils()
  db.on('fileChanged', (info) => {
    socket.emit('fileChanged', info)
  })
  return Object.freeze({
    addStory(msg) {
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
    updateContent(msg) {
      return db.updateContent(msg)
    },
    searchStories(query) {
      return db.search(query)
    },
    async runTests(testFile) {
      console.log('runTests...', testFile)
      if (!T.loaded(testFile)) {
        await T.load(testFile)
      }
      return await T.run((info) => {
        socket.emit('nuxtStoriesTestResult', info)
      })
    }
  })
}
