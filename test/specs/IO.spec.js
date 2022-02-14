import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs'
import { resolve } from 'path'
import ava from 'ava'
import { delay } from 'les-utils/utils/promise.js'
import { register, db } from '#root/lib/module.js'
import ioSvc from '#root/lib/io.js'

global.__dirname = 'lib'

const srcDir = resolve('.')
const { before, serial: test } = ava
const ctx = {
  options: {
    server: {
      host: 'localhost',
      port: 3000
    }
  }
}

function waitForFileChanged () {
  return new Promise((resolve) => {
    function fileChanged (stories) {
      db.off('fileChanged', fileChanged)
      resolve(stories)
    }
    db.on('fileChanged', fileChanged)
  })
}

before(async () => {
  await register.db({ srcDir })
})

test('IO (fileChange gets emitted)', async (t) => {
  const emitted = {}
  const socket = {
    emit (evt, data) {
      emitted[evt] = data
    }
  }
  ioSvc(socket)
  await db.watchFS()
  const p = waitForFileChanged()
  const newStory = {
    file: resolve('./stories/en/NewStory0.md'),
    content: 'some content here'
  }
  writeFileSync(newStory.file, newStory.content)
  await p
  t.truthy(emitted.fileChanged)
  unlinkSync(newStory.file)
})

test('IO (frontMatter fetch)', async (t) => {
  const emitted = {}
  const socket = {
    emit (evt, data) {
      emitted[evt] = data
    }
  }
  const svc = ioSvc(socket)
  // eslint-disable-next-line require-await
  global.fetch = async function (url) {
    // eslint-disable-next-line no-throw-literal
    throw 'Bogus url'
  }
  svc.fmFetch({
    fetchInfo: {
      item1: '/path/to/item'
    }
  })
  await delay(200)
  t.truthy(emitted.fmFetched)
})

test('IO (/styles)', async (t) => {
  global.__dirname = resolve(srcDir, 'lib/io')
  const cssFile = resolve(srcDir, 'lib/assets/css/appliedStyles.css')
  if (!existsSync(cssFile)) {
    writeFileSync(cssFile, '')
  }
  const { default: stylesSvc } = await import('#root/lib/io/styles.js')
  const svc = stylesSvc()
  svc.updateStyle({
    selector: '#design',
    style: { 'font-weight': 'bold' }
  })
  const css = readFileSync(cssFile, {
    encoding: 'utf-8'
  })
  t.true(css.includes('font-weight: bold;'))
  svc.updateStyle({
    selector: '#design',
    style: { 'font-size': '16px' }
  })
  const css2 = readFileSync(cssFile, {
    encoding: 'utf-8'
  })
  t.true(css2.includes('font-weight: bold;') && css2.includes('font-size: 16px;'))
  unlinkSync(cssFile)
})
