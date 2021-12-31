/* eslint-disable no-multi-str */
import { readFileSync } from 'fs'
import { resolve as pResolve } from 'path'
import test from 'ava'
import Markdown from '#root/lib/utils/markdown.js'

test('Markdown: Malformed frontmatter', (t) => {
  const input = '---\r\n\
items:\
  - a bullet here\r\n\
-\r\n\
---\r\n\
Finally the markdown '
  const parsed = Markdown.parse(input)
  t.is(JSON.stringify(parsed.frontMatter), '{}')
})

test('Markdown: Parse and Save (server-side)', (t) => {
  const mdPath = pResolve('./stories/en/Documentation.md')
  const contents = readFileSync(mdPath, { encoding: 'utf-8' })
  const { toc, md, compiled, frontMatter } = Markdown.parse(contents)
  t.truthy(toc)
  t.truthy(md)
  t.truthy(compiled)
  t.truthy(frontMatter)
})
