import { readdirSync } from 'fs'
import path from 'path'
import consola from 'consola'
import test from 'ava'
import NuxtStoriesMod from '@/modules/stories.module'
import { getModuleOptions } from '@/test/utils'

const srcDir = path.resolve('.')
const modules = []

function loadModule(modOptions) {
  consola.log('Testing with moduleOptions:', modOptions)
  return new Promise((resolve, reject) => {
    const pluginInfo = {}
    const sampleRoutes = []
    let doneCnt = 0
    const expCnt = 2
    function handleDone() {
      if (++doneCnt >= expCnt) resolve({ pluginInfo, sampleRoutes })
    }

    setTimeout(() => {
      doneCnt = expCnt
      handleDone()
    }, 500)

    const modContainer = {
      extendRoutes(fn) {
        consola.log('extendRoutes')
        try {
          fn(sampleRoutes, path.resolve)
        } catch (err) {
          reject(err)
        }
        handleDone()
      }
    }
    const simpleNuxt = {
      addPlugin({ src, fileName, options }) {
        Object.assign(pluginInfo, { src, fileName, options })
        handleDone()
      },
      options: {
        srcDir,
        modules
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
      NuxtStoriesMod
    }
    simpleNuxt.NuxtStoriesMod(modOptions)
  })
}

test('Story routes created ok', async (t) => {
  const modOptions = getModuleOptions('modules/stories.module')
  const { storiesDir } = modOptions
  modOptions.forceBuild = true
  const files = readdirSync(storiesDir)
  const storiesRoot = files[0]
  const { pluginInfo, sampleRoutes } = await loadModule(modOptions)
  const { src, fileName, options } = pluginInfo
  const storyRoute = sampleRoutes[0]
  t.is(storyRoute.name, storiesDir)
  t.is(storyRoute.path, `/${storiesDir}`)
  t.is(
    storyRoute.component,
    path.resolve(srcDir, `${storiesDir}/${storiesRoot}.vue`)
  )
  t.is(storyRoute.chunkName, `${storiesDir}/${storiesRoot}`)
  t.truthy(storyRoute.children)
  t.true(storyRoute.children.length > 0)
  t.is(src, path.resolve(srcDir, 'modules/stories.plugin.js'))
  t.is(fileName, 'nuxt-stories.js')
  t.is(options.storiesDir, storiesDir)
  t.is(options.storiesAnchor, storiesDir)
})

test('Story routes not created if storiesDir does not exist', async (t) => {
  const modOptions = {
    forceBuild: true,
    storiesDir: '.storiesX'
  }
  await loadModule(modOptions).catch((err) => {
    t.is(
      err.message,
      `Error: Story routes not created. Does the stories directory ${modOptions.storiesDir} exist?`
    )
  })
})

test('Module does not add bootstrap if it already has been added', async (t) => {
  modules[0] = 'bootstrap-vue/nuxt'
  const modOptions = {
    forceBuild: true,
    storiesDir: '.stories'
  }
  await loadModule(modOptions)
  t.pass()
})

test('Module does not add routes if forceBuild is false', async (t) => {
  modules[0] = 'bootstrap-vue/nuxt'
  const modOptions = {
    forceBuild: false,
    storiesDir: '.stories'
  }

  const { pluginInfo, sampleRoutes } = await loadModule(modOptions)
  t.is(Object.keys(pluginInfo).length, 0)
  t.is(sampleRoutes.length, 0)
})

test('Module adds routes ok using defaults (in dev mode)', async (t) => {
  process.env.NODE_ENV = 'development'
  const storiesDir = '.stories'
  const files = readdirSync(storiesDir)
  const storiesRoot = files[0]
  const { pluginInfo, sampleRoutes } = await loadModule({})
  const { src, fileName, options } = pluginInfo
  const storyRoute = sampleRoutes[0]
  t.is(storyRoute.name, storiesDir)
  t.is(storyRoute.path, `/${storiesDir}`)
  t.is(
    storyRoute.component,
    path.resolve(srcDir, `${storiesDir}/${storiesRoot}.vue`)
  )
  t.is(storyRoute.chunkName, `${storiesDir}/${storiesRoot}`)
  t.truthy(storyRoute.children)
  t.true(storyRoute.children.length > 0)
  t.is(src, path.resolve(srcDir, 'modules/stories.plugin.js'))
  t.is(fileName, 'nuxt-stories.js')
  t.is(options.storiesDir, storiesDir)
  t.is(options.storiesAnchor, storiesDir)
})
