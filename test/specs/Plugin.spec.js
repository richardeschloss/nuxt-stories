/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import test from 'ava'
import template from 'lodash/template'

test('Stories plugin', async (t) => {
  const src = path.resolve('./modules/stories.plugin.js')
  const tmpFile = path.resolve('./tmp.compiled.js')
  const content = fs.readFileSync(src, 'utf-8')
  const pluginOptions = {
    storiesDir: '.stories',
    storiesAnchor: '.stories'
  }

  try {
    const compiled = template(content)
    const pluginJs = compiled({ options: pluginOptions })
    fs.writeFileSync(tmpFile, pluginJs)
    const { default: Plugin } = await import(tmpFile).catch((err) => {
      console.error('Err importing plugin', err)
      t.fail()
    })

    Plugin({}, (label, NuxtStories) => {
      const { options } = NuxtStories({})
      t.is(label, 'nuxtStories')
      t.is(options.storiesDir, pluginOptions.storiesDir)
      t.is(options.storiesAnchor, pluginOptions.storiesAnchor)
      fs.unlinkSync(tmpFile)
    })
  } catch (e) {
    console.error('Could not compile plugin :(', e)
    t.fail()
  }
})
