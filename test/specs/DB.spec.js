import { existsSync, mkdirSync, readFileSync, unlinkSync, rmdirSync, writeFileSync } from 'fs'
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

function waitForFileChanged() {
  return new Promise((resolve) => {
    function fileChanged(stories) {
      db.off('fileChanged', fileChanged)
      resolve(stories)
    }
    db.on('fileChanged', fileChanged)  
  })
}

before(async () => {
  if (existsSync(dbFile)) {
    unlinkSync(dbFile)
  }
  db = DB({ srcDir })
  dbClient = DBClient()
})

test('Load DB (server and client)', async (t) => {
  await db.load()
  const items = db.find({})
  const fnd = await db.search('HOLA?', 'es')
  t.true(items.length > 0)

  const firstItem = db.findOne({})
  t.is(firstItem.href, items[0].href)

  // Test persistence
  const db2 = DB({ srcDir })
  await db2.load()
  const items2 = db2.find({})
  t.true(items2.length > 0)

  const clientDocsCnt = await dbClient.load()
  t.true(clientDocsCnt > 0)
  t.true(dbClient.cnt() > 0)
})

test('Build Tree', async (t) => { 
  const dir = pResolve('./stories/en/Very/Deep')
  mkdirSync(dir, { recursive: true })
  writeFileSync(pResolve(dir, 'VeryDeep.md'), 'Some content')
  await db.load()
  await dbClient.load()
  const sets = await Promise.all([
    db.buildTree(),
    dbClient.buildTree()
  ])
  sets.forEach((stories) => {
    t.true(stories.length > 0)
    t.truthy(stories[0].name)
    t.truthy(stories[0].order)
    t.truthy(stories[0].href)
    t.truthy(stories[0].children)
    t.is(stories.depth, 3)
  })

  const storiesEs = await db.buildTree('es')
  t.true(storiesEs[0].href.includes('/es/'))
  execSync('rm -rf ./stories/en/Very')
})

test('Search (server-side)', async (t) => {
  await db.load()
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

test('Update One', async (t) => {
  await db.addStory('/stories/en')
  await db.updateContent({ 
    href: '/stories/en/NewStory0' ,
    content: 'new content'
  })
  const db2 = DB({ srcDir })
  await db2.load()
  const fnd = db2.findOne({ href: '/stories/en/NewStory0' })
  t.is(fnd.content, 'new content')
  const fileContent = readFileSync(pResolve('./stories/en/NewStory0.md'), { encoding: 'utf-8' })
  t.is(fileContent, 'new content')
  execSync('rm ./stories/en/NewStory0.md')
})

test('Rename Story', async (t) => {
  await db.addStory('/stories/en') // --> NewStory0.md
  await db.addStory('/stories/en/NewStory0') // --> NewStory0/NewStory0.md
  let oldCnt = db.cnt()
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
  t.is(oldCnt, db.cnt())
  t.true(existsSync(pResolve('./stories/en/MyStory/MyName.md')))
  t.truthy(db.findOne({ href: '/stories/en/MyStory/MyName' }))
  execSync('rm -rf ./stories/en/MyStory ./stories/en/MyStory.md')
})

test('Remove Story', async (t) => {
  await db.addStory('/stories/en') // --> NewStory0.md
  await db.addStory('/stories/en/NewStory0') // --> NewStory0/NewStory0.md
  await db.addStory('/stories/en/NewStory0') // --> NewStory0/NewStory1.md
  await db.removeStory('/stories/en/NewStory0/NewStory1')
  
  t.falsy(db.findOne({ href: '/stories/en/NewStory0/NewStory1' }))
  t.false(existsSync(pResolve('./stories/en/NewStory0/NewStory1.md')))

  await db.removeStory('/stories/en/NewStory0')
  t.falsy(db.findOne({ href: '/stories/en/NewStory0' }))
  t.falsy(db.findOne({ href: '/stories/en/NewStory0/NewStory0' }))
  t.false(existsSync(pResolve('./stories/en/NewStory0')))
})

test('Load story', async (t) => {
  await db.load()
  const s1 = await db.loadStory('/stories/en/Todo')
  const s2 = await db.loadStory('/stories/en/Something/Module')
  const s3 = await db.loadStory('/stories/en/Something')
  t.truthy(s1.content)
  t.truthy(s2.content)
  t.truthy(s3.content)
  const s4 = await db.loadStory('/stories/en/Some/Deep/Tree/Example')
  t.falsy(s4)
  t.true(existsSync(pResolve('./stories/en/Something/Module.md')))
  t.true(existsSync(pResolve('./stories/en/Something.md')))
  t.false(existsSync(pResolve('./stories/en/Some/Deep/Tree/Example.md')))
  execSync('rm -rf ./stories/en/Something ./stories/en/Something.md')
})

test('Watch file changes (user-triggered)', async (t) => {
  let cnt = 0
  await db.watchFS()
  let p = waitForFileChanged()
  const newStory = {
    file: pResolve('./stories/en/NewStory0.md'),
    content: 'some content here'
  }
  writeFileSync(newStory.file, newStory.content)
  let stories = await p
  let fnd = stories.find(({href}) => href === '/stories/en/NewStory0')
  t.truthy(fnd)
  t.is(fnd.name, 'NewStory0')
  t.is(stories.depth, 2)
  p = waitForFileChanged()
  newStory.content = 'changed content here'
  writeFileSync(newStory.file, newStory.content)
  stories = await p

  const fndDoc = db.findOne({href: '/stories/en/NewStory0' })
  t.is(fndDoc.content, newStory.content)

  p = waitForFileChanged()
  unlinkSync(newStory.file)
  stories = await p
  fnd = stories.find(({href}) => href === '/stories/en/NewStory0')
  t.falsy(fnd)

  let oldCnt = db.cnt()
  const DeepDir = pResolve('./stories/en/Some/Deep')
  mkdirSync(DeepDir, { recursive: true })
  t.is(oldCnt, db.cnt())

  const deepStory = {
    file: pResolve('./stories/en/Some/Deep/Child.md'),
    content: 'I am deep'
  }
  p = waitForFileChanged()
  writeFileSync(deepStory.file, deepStory.content)
  stories = await p
  fnd = stories.find(({href}) => href === '/stories/en/Some')
  t.is(stories.depth, 3)
  t.truthy(fnd)
  t.is(fnd.children[0].name, 'Deep')
  t.is(fnd.children[0].children[0].name, 'Child')

  execSync('rm -rf ./stories/en/Some')
  db.off('notListening')

  // Test CRUD changes made by UI
  // (ensure watcher doesn't fire)
  let callCnt = 0
  db.on('fileChanged', () => callCnt++)
  await db.addStory('/stories/en')
  await db.updateContent({
    href: '/stories/en/NewStory',
    content: 'new content'
  })
  await db.renameStory({
    oldHref: '/stories/en/NewStory',
    newHref: '/stories/en/Renamed'
  })
  await db.removeStory('/stories/en/Renamed')


  t.is(callCnt, 0)
  
  execSync('rm ./stories/en/NewStory0.md')
})
