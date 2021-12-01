import { existsSync, readFileSync, unlinkSync } from 'fs'
import { resolve as pResolve } from 'path'
import { execSync } from 'child_process'
import ava from 'ava'
import DB from '#root/lib/db.server.js'
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

test.only('Init from FS', async (t) => {
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
  let oldCnt = db.cnt()
  await db.addStory('/stories/en')
  oldCnt++
  t.is(oldCnt, db.cnt())
  t.true(existsSync(pResolve('./stories/en/NewStory0.md')))
  t.truthy(db.findOne({ href: '/stories/en/NewStory0' }))

  await db.addStory('/stories/en/NewStory0')
  oldCnt++
  t.is(oldCnt, db.cnt())
  t.true(existsSync(pResolve('./stories/en/NewStory0/NewStory0.md')))
  t.truthy(db.findOne({ href: '/stories/en/NewStory0/NewStory0' }))
  execSync('rm -rf ./stories/en/NewStory0 ./stories/en/NewStory0.md')
})

test.only('Rename Story', async (t) => {
  await db.addStory('/stories/en') // --> NewStory0.md
  await db.addStory('/stories/en/NewStory0') // --> NewStory0/NewStory0.md
  await db.renameStory({
    oldHref: '/stories/en/NewStory0',
    newHref: '/stories/en/MyStory'
  })
  
  t.true(existsSync(pResolve('./stories/en/MyStory/NewStory0.md')))
  t.truthy(db.findOne({ href: '/stories/en/MyStory/NewStory0' }))

  await db.renameStory({
    oldHref: '/stories/en/MyStory/NewStory0',
    newHref: '/stories/en/MyStory/MyName'
  })
  t.true(existsSync(pResolve('./stories/en/MyStory/MyName.md')))
  t.truthy(db.findOne({ href: '/stories/en/MyStory/MyName' }))
  execSync('rm -rf ./stories/en/MyStory ./stories/en/MyStory.md')
})

test('Remove Story', async (t) => {
  await db.removeStory({ href: '/stories/en/Changed'})
  const fnd = await db.findOne({ href: '/stories/en/Changed' })
  t.is(fnd, null)
  const oldCnt = db.cnt()
  await db.removeStory({ href: '/stories/en/NotExist'})
  t.is(oldCnt, db.cnt())
})

test('Build Tree', async (t) => {
  const sets = [
    db.buildTree(),
    dbClient.buildTree()
  ]
  sets.forEach((stories) => {
    t.true(stories.length > 0)
    t.truthy(stories[0].name)
    t.truthy(stories[0].order)
    t.truthy(stories[0].href)
    t.truthy(stories[0].children)
  })

  const storiesEs = db.buildTree('es')
  t.true(storiesEs[0].href.includes('/es/'))
})