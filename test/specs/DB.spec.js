import { resolve as pResolve } from 'path'
import { promisify } from 'util'
import Glob from 'glob'
import ava from 'ava'
import DB from '#root/lib/db.js'

const glob = promisify(Glob)
const srcDir = pResolve('.')
const storiesDir = 'stories'
const lang = 'en'
const basePath = pResolve(srcDir, storiesDir, lang)
const pattern = '**/*.md'
const db = DB({})

const { serial: test } = ava

test('Init from FS', async (t) => {
  const files = await await glob(pResolve(basePath, pattern))
  db.initFromFS(files, srcDir, storiesDir, lang)
  const items = db.find({})
  t.true(items.length > 0)
})

test('Search', async (t) => {
  const hits = await db.search('Nice')
  t.true(hits.length > 0)
  hits.forEach((hit) => { 
    t.truthy(hit.labels)
    t.truthy(hit.href)
    t.truthy(hit.content)
    t.truthy(hit.preview)
  })
})