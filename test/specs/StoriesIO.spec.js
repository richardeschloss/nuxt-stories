import { exec } from 'child_process'
import { existsSync, readFileSync, unlinkSync } from 'fs'
import { resolve as pResolve, parse as pParse } from 'path'
import { serial as test, before } from 'ava'
import StoriesIO from '@/lib/stories.io'
import { register, storyPath } from '@/lib/module.register'

const storiesIO = StoriesIO()
const srcDir = pResolve('.')
const storiesDir = 'stories'
const storiesAnchor = storiesDir
const lang = 'en'

before(() => {
  register.options({ srcDir, storiesDir, lang })
})

test('Add story (L0)', (t) => {
  const name = 'NewStory'
  const mdPath = `${storiesDir}/${lang}/${name}.md`
  const expectedPath = storyPath(mdPath)
  storiesIO.addStory({ name, mdPath })
  const contents = readFileSync(expectedPath)
  t.true(contents.includes(`title: ${name}`))
  unlinkSync(expectedPath)
})

test('Add story (L1)', (t) => {
  const parent = 'NewStory'
  const name = 'child1'
  const mdPath = `${storiesDir}/${lang}/${parent}/${name}.md`
  const expectedPath = storyPath(mdPath)
  storiesIO.addStory({ name, mdPath })
  const contents = readFileSync(expectedPath)
  t.true(contents.includes(`title: ${name}`))
})

test('Add story (L1, dir already exists)', (t) => {
  const parent = 'NewStory'
  const name = 'child1'
  const mdPath = `${storiesDir}/${lang}/${parent}/${name}.md`
  const expectedPath = storyPath(mdPath)
  const { dir: fullDir } = pParse(expectedPath)
  storiesIO.addStory({ name, mdPath })
  const contents = readFileSync(expectedPath)
  t.true(contents.includes(`title: ${name}`))
  exec(`rm -rf ${fullDir} ${expectedPath}`)
})

test('Fetch story', (t) => {
  const mdPath = 'stories/en/Examples.md'
  const contents = storiesIO.fetchStory({ mdPath })
  t.is(typeof contents, 'string')
  t.true(contents.length > 0)
})

test('Fetch Stories', async (t) => {
  const { routes, stories } = await storiesIO.fetchStories({
    storiesDir,
    storiesAnchor,
    lang
  })
  t.true(stories.length > 0)
  t.is(routes.name, storiesAnchor)
  t.true(routes.children.length > 0)
})

test('Rename Story', (t) => {
  const oldName = 'RenameMe'
  const newName = 'Renamed'
  const oldPath = `${storiesDir}/${lang}/${oldName}.md`
  const newPath = `${storiesDir}/${lang}/${newName}.md`
  const oldFullPath = storyPath(oldPath)
  const newFullPath = storyPath(newPath)
  storiesIO.addStory({ name: oldName, mdPath: oldPath })
  storiesIO.renameStory({ oldPath, newPath })
  t.false(existsSync(oldFullPath))
  t.true(existsSync(newFullPath))

  const childName = 'child1'
  const childPath = `${storiesDir}/${lang}/${newName}/${childName}.md`
  const childPath2 = `${storiesDir}/${lang}/${newName}/${childName}2.md`
  const expectedChildPath = storyPath(childPath)
  const expectedChildPath2 = storyPath(childPath2)
  storiesIO.addStory({ name: childName, mdPath: childPath, dir: newName })
  t.true(existsSync(expectedChildPath))

  storiesIO.renameStory({ oldPath: childPath, newPath: childPath2 })
  t.false(existsSync(expectedChildPath))
  t.true(existsSync(expectedChildPath2))

  const newPath2 = `${storiesDir}/${lang}/${newName}Again.md`
  const newFullPath2 = storyPath(newPath2)
  const { name: newDirName, dir: newDir } = pParse(newFullPath2)
  const newFullDir = pResolve(newDir, newDirName)

  storiesIO.renameStory({ oldPath: newPath, newPath: newPath2 })
  t.false(existsSync(newFullPath))
  t.true(existsSync(newFullPath2))
  exec(`rm -rf ${newFullDir} ${newFullPath2}`)
})

test('Remove Story (L1, then L0)', (t) => {
  const parent = 'RemoveMe'
  const child = 'child1'
  const mdPath1 = `${storiesDir}/${lang}/${parent}.md`
  const mdPath2 = `${storiesDir}/${lang}/${parent}/${child}.md`
  const fullPath1 = storyPath(mdPath1)
  const { name: dirName, dir } = pParse(fullPath1)
  const fullDir1 = pResolve(dir, dirName)
  const fullPath2 = storyPath(mdPath2)
  storiesIO.addStory({ name: parent, mdPath: mdPath1 })
  storiesIO.addStory({ name: child, mdPath: mdPath2 })
  t.true(existsSync(fullPath1))
  t.true(existsSync(fullPath2))

  storiesIO.removeStory({ path: mdPath2 })
  t.false(existsSync(fullPath2))

  storiesIO.removeStory({ path: mdPath1 })
  t.false(existsSync(fullPath1))
  t.false(existsSync(fullDir1))
})

test('Save Markdown', (t) => {
  const mdPath = 'stories/en/SeeMe.md'
  const fullPath = storyPath(mdPath)
  const contents = 'Stuff here'
  storiesIO.saveMarkdown({ mdPath, contents })
  const readContents = readFileSync(fullPath, { encoding: 'utf-8' })
  t.is(contents, readContents)
  unlinkSync(fullPath)
})

test('Front matter fetch', async (t) => {
  /*
  * Here, trigger an error on purpose, but break the rules with
  * proper error handling because I think we still want to send
  * the same "fmFetched" event so the user sees the error in the compiled
  * screen right away.
  */
  const socket = {
    emit (evt, { key, resp }) {
      t.is(evt, 'fmFetched')
      t.is(key, 'someCsv')
      t.is(resp, 'Only absolute URLs are supported')
    }
  }
  await StoriesIO(socket).fmFetch({
    fetchInfo: {
      someCsv: '/someFile.csv'
    }
  })
})
