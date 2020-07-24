import { writeFileSync } from 'fs'
import Markdown from './markdown.client'

const MarkdownOut = {
  ...Markdown,
  save ({ mdPath, contents }) {
    writeFileSync(mdPath, contents)
  }
}

export default MarkdownOut
