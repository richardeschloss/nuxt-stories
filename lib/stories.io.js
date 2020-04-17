/* eslint-disable no-console */
import Markdown from './utils/markdown.server'

export default function(socket, io) {
  return Object.freeze({
    saveMarkdown: Markdown.save
  })
}
