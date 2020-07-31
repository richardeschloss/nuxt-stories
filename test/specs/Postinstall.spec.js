import { exec } from 'child_process'
import { existsSync, mkdirSync } from 'fs'

import { resolve as pResolve } from 'path'
import { serial as test } from 'ava'
import { delay } from 'nuxt-test-utils'

test('Files are not overwritten', async (t) => {
  process.env.INIT_CWD = '.'
  require('@/postinstall')
  await delay(3000)
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'assets/css/stories.min.css')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'assets/scss/stories.overrides.scss')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'components')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'layouts/stories.vue')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'stories')))
})

test('Files are copied over ok', async (t) => {
  process.env.INIT_CWD = './tmp'
  try {
    delete require.cache[pResolve('./postinstall.js')]
  } catch (err) {
  }

  mkdirSync(process.env.INIT_CWD)
  require('@/postinstall')
  await delay(3000)
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'assets/css/stories.min.css')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'assets/scss/stories.overrides.scss')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'components')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'layouts/stories.vue')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'stories')))
  exec(`rm -rf ./tmp`)
})
