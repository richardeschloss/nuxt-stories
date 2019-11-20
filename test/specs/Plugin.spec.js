/* eslint-disable no-console */
import { resolve as pResolve } from 'path'
import consola from 'consola'
import test, { before, after } from 'ava'
import { compilePlugin, removeCompiledPlugin } from '@/test/utils'

let Plugin
const src = pResolve('./modules/stories.plugin.js')
const tmpFile = pResolve('./modules/stories.plugin.compiled.js')
const pluginOptions = {
  storiesDir: '.stories',
  storiesAnchor: '.stories'
}

async function compile(t) {
  const compiled = await compilePlugin({
    src,
    tmpFile,
    options: pluginOptions
  }).catch((err) => {
    consola.error(err)
    t.fail()
  })
  Plugin = compiled.Plugin
  t.pass()
}

function loadPlugin(t) {
  return new Promise((resolve, reject) => {
    const context = {}
    Plugin(context, (label, NuxtStories) => {
      const { options } = NuxtStories({})
      t.is(label, 'nuxtStories')
      t.is(options.storiesDir, pluginOptions.storiesDir)
      t.is(options.storiesAnchor, pluginOptions.storiesAnchor)
      resolve()
    })
  })
}

before('Compile plugin', compile)

after('Remove compiled plugin', () => {
  removeCompiledPlugin(tmpFile)
})

test('Stories plugin', async (t) => {
  await loadPlugin(t).catch((err) => {
    console.log('Error loading plugin', err)
    t.fail()
  })
})
