import { exec } from 'child_process'
import { existsSync } from 'fs'

import { resolve as pResolve } from 'path'
import { serial as test, before } from 'ava'
import { delay } from 'nuxt-test-utils'

// before('Start clean', () => {
//   process.env.INIT_CWD = '.'
//   const otherDirs = ['components', 'assets', 'assets/css', 'assets/scss']
//   otherDirs.forEach(async (d) => {
//     exec(`rm -rf ${d}`)
//     await delay(100)
//   })
// })

test('Files are copied over ok', async (t) => {
  process.env.INIT_CWD = '/tmp'
  require('@/postinstall')
  await delay(3000)
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'assets/css/stories.min.css')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'assets/scss/stories.overrides.scss')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'components')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'layouts/stories.vue')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'stories')))
  const rmDirs = [
    'assets',
    'components',
    'layouts',
    'store',
    'stories'
  ].map(d => `${process.env.INIT_CWD}/${d}`)
    .join(' ')
  exec(`rm -rf ${rmDirs}`)
})

test('Files are not overwritten', async (t) => {
  process.env.INIT_CWD = '.'
  try {
    delete require.cache[require.resolve('@/postinstall')]
  } catch (err) {

  }
  require('@/postinstall')
  await delay(3000)
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'assets/css/stories.min.css')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'assets/scss/stories.overrides.scss')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'components')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'layouts/stories.vue')))
  t.true(existsSync(pResolve(process.env.INIT_CWD, 'stories')))
})

test.skip('Stories are created if they do not already exist', (t) => {
  process.env.INIT_CWD = '/tmp'
  try {
    delete require.cache[require.resolve('@/postinstall')]
  } catch (err) {

  }
  require('@/postinstall')
  t.true(existsSync(pResolve('/tmp/stories')))
  exec('rm -rf /tmp/stories')
})
