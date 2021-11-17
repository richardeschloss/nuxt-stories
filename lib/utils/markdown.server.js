import { readFileSync, writeFileSync } from 'fs'
import Markdown from './markdown.client.js'

const MarkdownOut = {
  ...Markdown,
  load: mdPath => readFileSync(mdPath, { encoding: 'utf-8' }),
  save ({ mdPath, contents }) {
    writeFileSync(mdPath, contents)
  }
}

export default MarkdownOut
