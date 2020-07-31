/* eslint-disable no-console */
import { exec } from 'child_process'
import { existsSync, mkdirSync } from 'fs'

import { resolve as pResolve } from 'path'
import { serial as test, before, after } from 'ava'
import { delay } from 'nuxt-test-utils'

// before('Start clean', () => {
//   process.env.INIT_CWD = '.'
//   const otherDirs = ['components', 'assets', 'assets/css', 'assets/scss']
//   otherDirs.forEach(async (d) => {
//     exec(`rm -rf ${d}`)
//     await delay(100)
//   })
// })
// after(() => {
//   exec(`rm -rf ./tmp`)
// })

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
  // console.log('cache', Object.keys(require.cache).filter(k => k.includes('postinstall')))
  console.log('cache', pResolve('./postinstall.js'))
  // console.log('cache', require.resolve('./postinstall'))
  try {
    delete require.cache[pResolve('./postinstall.js')] // [require.resolve('./postinstall')]
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('req error!', err)
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
  // const rmDirs = [
  //   'assets',
  //   'components',
  //   'layouts',
  //   'store',
  //   'stories'
  // ].map(d => `${process.env.INIT_CWD}/${d}`)
  //   .join(' ')
  // exec(`rm -rf ./tmp`) // ${rmDirs}`)
})
