/* eslint-disable no-console */
const { existsSync, mkdirSync } = require('fs')
const { resolve: pResolve } = require('path')
const gentlyCopy = require('gently-copy')

const destDir = pResolve(process.env.INIT_CWD)
const storiesDir = pResolve(__dirname, 'stories')
const resolvedStoriesDir = pResolve(destDir, 'stories')

// eslint-disable-next-line no-console
console.log('copy to', resolvedStoriesDir)
if (!existsSync(resolvedStoriesDir)) {
  console.log('does NOT exist...')
  mkdirSync(resolvedStoriesDir)
  gentlyCopy(storiesDir, resolvedStoriesDir, { overwrite: false })
} else {
  console.log('exists....')
}

const otherDirs = [
  'assets',
  'assets/css',
  'assets/scss',
  'assets/svg',
  'components',
  'layouts',
  'store'
]

otherDirs.forEach((d, idx) => {
  const resolvedDir = pResolve(destDir, d)
  if (!existsSync(resolvedDir)) {
    mkdirSync(resolvedDir)
  }

  if (d !== 'components') {
    gentlyCopy(pResolve(__dirname, `lib/${d}/*`), pResolve(destDir, d))
  }
})
