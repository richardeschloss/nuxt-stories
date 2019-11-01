/* eslint-disable no-console */
import { readdirSync } from 'fs'
import path from 'path'
import test from 'ava'
import NuxtStoriesMod from '@/modules/stories.module'

const srcDir = path.resolve('.')

test('Story routes created ok', (t) => {
  const storiesDir = '.stories'
  const forceBuild = true
  const modOptions = {
    forceBuild,
    storiesDir
  }
  const files = readdirSync(storiesDir)
  const storiesRoot = files[0]
  return new Promise((resolve) => {
    let doneCnt = 0
    const expCnt = 2
    function handleDone() {
      if (++doneCnt === expCnt) resolve()
    }
    const sampleRoutes = []
    const modContainer = {
      extendRoutes(fn) {
        fn(sampleRoutes, path.resolve)
        const storyRoute = sampleRoutes[0]
        console.log('storyRoute', storyRoute)
        t.is(storyRoute.name, storiesDir)
        t.is(storyRoute.path, `/${storiesDir}`)
        t.is(
          storyRoute.component,
          path.resolve(srcDir, `${storiesDir}/${storiesRoot}.vue`)
        )
        t.is(storyRoute.chunkName, `${storiesDir}/${storiesRoot}`)
        t.truthy(storyRoute.children)
        t.true(storyRoute.children.length > 0)
        handleDone()
      }
    }
    const simpleNuxt = {
      addPlugin({ src, fileName, options }) {
        console.log('options', options)
        t.is(src, path.resolve(srcDir, 'modules/stories.plugin.js'))
        t.is(fileName, 'nuxt-stories.js')
        t.is(options.storiesDir, storiesDir)
        t.is(options.storiesAnchor, storiesDir)
        handleDone()
      },
      options: {
        srcDir,
        modules: []
      },
      nuxt: {
        hook(evt, fn) {
          console.log('hook', evt)
          if (evt === 'modules:done') {
            console.log('run hook')
            fn(modContainer)
          }
        }
      },
      registerMod: NuxtStoriesMod
    }
    simpleNuxt.registerMod(modOptions)
  })
})
