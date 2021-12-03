import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs'
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
  db = DB({ srcDir })
  dbClient = DBClient()
  
})

test.only('Init Items', async (t) => {
  await db.load()
  const items = db.find({})
  const fnd = await db.search('HOLA?', 'es')
  t.true(items.length > 0)

  const firstItem = db.findOne({})
  t.is(firstItem.href, items[0].href)

  // Test persistence
  const db2 = DB({})
  await db2.load()
  const items2 = db2.find({})
  t.true(items2.length > 0)

  const clientDocsCnt = await dbClient.load()
  t.true(clientDocsCnt > 0)
})

test('Build Tree', async (t) => { 
  const dir = pResolve('./stories/en/Some/Deep')
  mkdirSync(dir, { recursive: true })
  writeFileSync(pResolve(dir, 'VeryDeep.md'), 'Some content')
  await db.initFromFS(pResolve(srcDir, storiesDir, '**/*.md'))
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

  execSync('rm -rf ./stories/en/Some')
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
  await db.addStory('/stories/en')
  await db.updateContent({ 
    href: '/stories/en/NewStory0' ,
    content: 'new content'
  })
  const db2 = await DB({})
  const fnd = db2.findOne({ href: '/stories/en/NewStory0' })
  t.is(fnd.content, 'new content')
  const fileContent = readFileSync(pResolve('./stories/en/NewStory0.md'), { encoding: 'utf-8' })
  t.is(fileContent, 'new content')
  execSync('rm ./stories/en/NewStory0.md')
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

// Clean up..
test.skip('Watch file changes (user-triggered)', (t) => {
  let cnt = 0
  return new Promise(async (resolve) => {
    function watchChg1(stories) {
      console.log('info changed', ++cnt, stories)
      t.true(stories.length > 0)
      resolve()
    }
    // db.on('fileChanged', watchChg1)
    await db.watchFS()
    db.on('fileChanged', watchChg1)
    // const newStory = await db.addStory('/stories/en')
    // db.updateContent({
    //   href: '/stories/en/NewStory0',
    //   content: 'new content'
    // })
    const content = 'changed content xyz'
    // console.log('update', newStory.file)
    writeFileSync(pResolve('./stories/en/NewStory0.md'), content) 
    
  
    // db.off('fileChanged', watchChg1)
    // db.off('nonExist', () => {})
    // t.pass()
  })
})

test('Load story', async (t) => {
  const s1 = await db.load('/stories/en/Todo')
  // console.log('s1', s1)
  const s2 = await db.load('/stories/en/Lib')
  // console.log('s2', s2)
  const s3 = await db.load('/stories/en/Examples/Example333')

  await db.load('/stories/en/Lib/Deep/Tree/Example')
  const fnd = db.findOne({ href: '/stories/en/Lib' })
  // console.log('fnd', fnd)
  // const stories = await db.initFromFS()
  t.pass()
})