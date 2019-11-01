import { readdirSync } from 'fs'
import path from 'path'
import consola from 'consola'
import test from 'ava'
import NuxtStoriesMod from '@/modules/stories.module'
import { getModuleOptions } from '@/test/utils'

const srcDir = path.resolve('.')
const modOptions = getModuleOptions('modules/stories.module')

test('Story routes created ok', (t) => {
  const { storiesDir } = modOptions
  modOptions.forceBuild = true
  consola.log('Testing with moduleOptions:', modOptions)
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
        consola.log('extendRoutes')
        fn(sampleRoutes, path.resolve)
        const storyRoute = sampleRoutes[0]
        consola.log('storyRoute', storyRoute)
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
        consola.log('options', options)
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
          consola.log('hook', evt)
          if (evt === 'modules:done') {
            consola.log('run hook')
            fn(modContainer)
          }
        }
      },
      registerMod: NuxtStoriesMod
    }
    simpleNuxt.registerMod(modOptions)
  })
})
