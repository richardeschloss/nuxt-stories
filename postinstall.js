const { existsSync, mkdirSync } = require('fs')
const { resolve: pResolve } = require('path')
const gentlyCopy = require('gently-copy')

const destDir = process.env.INIT_CWD
const storiesDir = [pResolve(__dirname, 'stories')]
gentlyCopy(storiesDir, destDir, { overwrite: false })

const otherDirs = [
  'assets',
  'assets/css',
  'assets/scss',
  'assets/svg',
  'layouts'
]

/* istanbul ignore next */
if (!existsSync('components')) {
  mkdirSync('components')
}

otherDirs.forEach((d, idx) => {
  if (!existsSync(d)) {
    mkdirSync(d)
  }

  gentlyCopy(pResolve(__dirname, `lib/${d}/*`), pResolve(destDir, d))
})
