import { existsSync, renameSync, rmdirSync, unlinkSync, mkdirSync as sync } from 'fs'
import { resolve as pResolve, parse as pParse } from 'path'
import Markdown from './utils/markdown.server.js'
import { storyPath, register, db } from './module.js'
import FetchSvc from './utils/fetch.js'
import { fetchComponents } from './utils/autoImport.server.js'

export default function (socket, io) {
  return Object.freeze({
    addStory ({ name, mdPath }) {
      const fullPath = storyPath(mdPath)
      const { dir: fullDir } = pParse(fullPath)
      if (!existsSync(fullDir)) {
        sync(fullDir)
      }
      return Markdown.save({
        mdPath: fullPath,
        contents: `---\r\n  title: ${name}\r\n---\r\n`
      })
    },
    fetchComponents,
    fetchStory: ({ mdPath }) => Markdown.load(storyPath(mdPath)),
    fetchStories: register.routes,
    fmFetch: ({ notify, ...info }) => FetchSvc.fetch({
      ...info,
      notify (msg) {
        socket.emit('fmFetched', { path: info.path, ...msg })
      }
    }),
    removeStory ({ path, recursive = true }) {
      const fullPath = storyPath(path)
      const { name: dirName, dir } = pParse(fullPath)
      const fullDir = pResolve(dir, dirName)
      unlinkSync(fullPath)
      if (existsSync(fullDir)) {
        rmdirSync(fullDir, { recursive })
      }
    },
    renameStory ({ oldPath, newPath }) {
      const oldFullPath = storyPath(oldPath)
      const newFullPath = storyPath(newPath)
      const { name: oldDirName, dir: oldDir } = pParse(oldFullPath)
      const { name: newDirName, dir: newDir } = pParse(newFullPath)
      const oldFullDir = pResolve(oldDir, oldDirName)
      const newFullDir = pResolve(newDir, newDirName)
      renameSync(oldFullPath, newFullPath)
      if (existsSync(oldFullDir)) {
        renameSync(oldFullDir, newFullDir)
      }
    },
    saveMarkdown: ({ mdPath, contents }) =>
      Markdown.save({
        mdPath: storyPath(mdPath),
        contents
      }),
    async searchStories(query) {
      return await db.search(query)
    }
  })
}
