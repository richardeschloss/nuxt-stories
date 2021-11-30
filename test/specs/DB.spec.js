import { existsSync, readFileSync, unlinkSync } from 'fs'
import { resolve as pResolve } from 'path'
import ava from 'ava'
import DB from '#root/lib/db.js'
import DBClient from '#root/lib/db.client.js'

const srcDir = pResolve('.')
const storiesDir = 'stories'
const lang = 'en'
const basePath = pResolve(srcDir, storiesDir, lang)
const pattern = '**/*.md'
let db, dbClient

const { serial: test, before } = ava
const dbFile = pResolve('./stories/stories.db')
const fetched = []

global.fetch = async function(url) {
  fetched.push(url)
  return {
    json() {
      return JSON.parse(readFileSync(dbFile, { encoding: 'utf-8' }))
    }
  }
}

before(async () => {
  if (existsSync(dbFile)) {
    unlinkSync(dbFile)
  }
  db = await DB({ srcDir, autosave: false })
})

test('Init from FS', async (t) => {
  await db.initFromFS(pResolve(srcDir, storiesDir, '**/*.md'))
  const items = db.find({})
  const fnd = await db.search('HOLA?', 'es')
  t.true(items.length > 0)

  const firstItem = db.findOne({})
  t.is(firstItem.href, items[0].href)

  // Test persistence
  const db2 = await DB({})
  const items2 = db2.find({})
  t.true(items2.length > 0)
})

test('Init (client-side)', async (t) => {
  dbClient = DBClient()
  const cnt = await dbClient.load()
  t.true(cnt > 0)
})

test('Search (server-side)', async (t) => {
  const hits = await db.search('Nice')
  t.true(hits.length > 0)
  hits.forEach((hit) => { 
    t.truthy(hit.labels)
    t.truthy(hit.href)
    t.truthy(hit.content)
    t.truthy(hit.preview)
  })

  const hits2 = await db.search('!HOLA', 'es')
  t.is(hits2[0].content,  '# !HOLA! from Story1 in Spanish')
})

test('Search (client-side)', async (t) => {
  const hits = await dbClient.search('Nice')
  t.true(hits.length > 0)
  hits.forEach((hit) => { 
    t.truthy(hit.labels)
    t.truthy(hit.href)
    t.truthy(hit.content)
    t.truthy(hit.preview)
  })
})

test('Update One', async (t) => {
  await db.updateContent({ 
    href: '/stories/en/Examples/Example2' ,
    content: 'new content'
  })
  const db2 = await DB({})
  const fnd = db2.findOne({ href: '/stories/en/Examples/Example2' })
  t.is(fnd.content, 'new content')
})

test('Add Story', async (t) => {
  const oldCnt = db.cnt()
  await db.addStory({
    href: '/stories/en/Something/New',
    content: 'A new story',
    storiesDir: 'stories', 
    lang: 'en'
  })
  t.is(oldCnt + 1, db.cnt())
  const fnd = db.findOne({ href: '/stories/en/Something/New' })
  t.is(fnd.href, '/stories/en/Something/New')

  await db.addStory({
    href: '/stories/en/Something/New',
    content: 'A new story',
    storiesDir: 'stories', 
    lang: 'en'
  })
  t.is(oldCnt + 1, db.cnt())
})

test('Rename Story', async (t) => {
  await db.renameStory({
    oldHref: '/stories/en/Something/New',
    href: '/stories/en/Changed'
  })
  const fnd = await db.findOne({ href: '/stories/en/Changed' })
  const fnd2 = await db.findOne({ href: '/stories/en/Something/New' })
  t.is(fnd.href, '/stories/en/Changed')
  t.is(fnd2, null)
})

test('Remove Story', async (t) => {
  await db.removeStory({ href: '/stories/en/Changed'})
  const fnd = await db.findOne({ href: '/stories/en/Changed' })
  t.is(fnd, null)
  const oldCnt = db.cnt()
  await db.removeStory({ href: '/stories/en/NotExist'})
  t.is(oldCnt, db.cnt())
})