const { existsSync, mkdirSync } = require('fs')
const { resolve: pResolve } = require('path')
const gentlyCopy = require('gently-copy')

const destDir = process.env.INIT_CWD
const srcDirs = ['lib']
const otherDirs = [
  'assets',
  'assets/css',
  'assets/scss',
  'assets/svg',
  'layouts'
]
otherDirs.forEach((d, idx) => {
  if (!existsSync(d)) {
    mkdirSync(d)
  }
})

gentlyCopy(srcDirs, destDir, { overwrite: false })
gentlyCopy('lib/assets/css/*', pResolve(destDir, 'assets/css'))
gentlyCopy('lib/assets/scss/*', pResolve(destDir, 'assets/scss'))
gentlyCopy('lib/assets/svg/*', pResolve(destDir, 'assets/svg'))
gentlyCopy('lib/layouts/stories.vue', pResolve(destDir, 'layouts'))
