/* eslint-disable no-console */
import { resolve as pResolve } from 'path'
import consola from 'consola'
import { serial as test } from 'ava'
import { compilePlugin, removeCompiledPlugin } from '@/test/utils'

let Plugin
const src = pResolve('./modules/stories.plugin.js')
const tmpFile = pResolve('./modules/stories.plugin.compiled.js')

async function compile(t, options) {
  const compiled = await compilePlugin({
    src,
    tmpFile,
    options
  }).catch((err) => {
    consola.error(err)
    t.fail()
  })
  Plugin = compiled.Plugin
  t.pass()
}

function loadPlugin(t, pluginOptions) {
  return new Promise((resolve, reject) => {
    const context = {}
    Plugin(context, (label, NuxtStories) => {
      const { options } = NuxtStories({})
      t.is(label, 'nuxtStories')
      t.is(options.storiesDir, pluginOptions.storiesDir)
      t.is(options.storiesAnchor, pluginOptions.storiesAnchor)
      t.is(options.markdownEnabled, pluginOptions.markdownEnabled)
      resolve()
    })
  })
}

test('Stories plugin (markdown disabled)', async (t) => {
  const pluginOptions = {
    storiesDir: '.stories',
    storiesAnchor: '.stories',
    markdownEnabled: false
  }
  await compile(t, pluginOptions)
  await loadPlugin(t, pluginOptions).catch((err) => {
    console.log('Error loading plugin', err)
    t.fail()
  })
  removeCompiledPlugin(tmpFile)
})

test('Stories plugin (markdown enabled)', async (t) => {
  delete require.cache[tmpFile]
  const pluginOptions = {
    storiesDir: '.stories',
    storiesAnchor: '.stories',
    markdownEnabled: true
  }
  await compile(t, pluginOptions)
  await loadPlugin(t, pluginOptions).catch((err) => {
    console.log('Error loading plugin', err)
    t.fail()
  })
})
