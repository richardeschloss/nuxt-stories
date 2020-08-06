import { existsSync, renameSync, rmdirSync, unlinkSync } from 'fs'
import { resolve as pResolve, parse as pParse } from 'path'
import { sync } from 'mkdirp'
import Markdown from './utils/markdown.server'
import { storyPath, register } from './module.register'

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
    fetchStory: ({ mdPath }) => Markdown.load(storyPath(mdPath)),
    fetchStories: register.routes,
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
      })
  })
}
