import { exec } from 'child_process'
import { existsSync } from 'fs'

import { resolve as pResolve } from 'path'
import test, { before } from 'ava'
import { delay } from 'nuxt-test-utils'

before('Start clean', () => {
  const otherDirs = ['assets', 'assets/css', 'assets/scss']
  otherDirs.forEach(async (d) => {
    exec(`rm -rf ${d}`)
    await delay(100)
  })
})

test('Files are copied over ok', async (t) => {
  require('@/postinstall')
  await delay(3000)
  t.true(existsSync(pResolve('./assets/css/stories.min.css')))
  t.true(existsSync(pResolve('./assets/scss/stories.overrides.scss')))
  t.true(existsSync(pResolve('./layouts/stories.vue')))
})

test('Files are not overwritten', async (t) => {
  try {
    delete require.cache[require.resolve('@/postinstall')]
  } catch (err) {
    
  }
  require('@/postinstall')
  await delay(3000)
  t.true(existsSync(pResolve('./assets/css/stories.min.css')))
  t.true(existsSync(pResolve('./assets/scss/stories.overrides.scss')))
  t.true(existsSync(pResolve('./layouts/stories.vue')))
})
