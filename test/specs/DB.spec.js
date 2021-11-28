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
let db

const { serial: test, before } = ava

before(async () => {
  db = await DB({ autosave: false })
})

test.only('Init from FS', async (t) => {
  const files = await await glob(pResolve(basePath, pattern))
  await db.initFromFS(files, srcDir, storiesDir, lang)
  const items = db.find({})
  t.true(items.length > 0)

  // Test persistence
  const db2 = await DB({})
  const items2 = db2.find({})
  t.true(items2.length > 0)
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

test('Update One', async (t) => {
  // console.log(db.find())
  await db.upsert()
  const db2 = await DB({})
  console.log(db2.findOne({ href: '/stories/en/Examples/Example2' }))
  
  t.pass()
})