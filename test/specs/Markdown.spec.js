/* eslint-disable no-multi-str */
/* eslint-disable no-console */
import { readFileSync, unlinkSync } from 'fs'
import { resolve as pResolve } from 'path'
import test from 'ava'
import Markdown from '@/lib/utils/markdown.server'

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
  const mdPath = pResolve('./stories/en/index/Examples/Example2.md')
  const contents = readFileSync(mdPath, { encoding: 'utf-8' })
  const { toc, md, compiled, frontMatter } = Markdown.parse(contents)
  const tmpFile = '/tmp/Example2.md'
  Markdown.save({ mdPath: tmpFile, contents })
  const contents2 = readFileSync(tmpFile, { encoding: 'utf-8' })
  unlinkSync(tmpFile)
  t.is(contents.length, contents2.length)
  t.truthy(toc)
  t.truthy(md)
  t.truthy(compiled)
  t.truthy(frontMatter)
})
