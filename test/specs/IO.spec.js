import { writeFileSync, unlinkSync } from 'fs'
import { resolve } from 'path'
import ava from 'ava'
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
  const svc = ioSvc(socket)
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
