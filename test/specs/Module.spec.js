/* eslint-disable no-console */
import path from 'path'

import test from 'ava'
import config from '@/nuxt.config'
import NuxtStoriesMod from '@/lib/stories.module'

import { delay, getModuleOptions } from 'nuxt-test-utils'

const srcDir = path.resolve('.')

function loadModule ({
  modOptions,
  modules = [],
  io,
  server = {
    host: 'localhost',
    port: 3000
  },
  expCnt = {}
}) {
  console.log('Testing with moduleOptions:', modOptions)
  return new Promise((resolve, reject) => {
    const timeout = 1500
    const sampleRoutes = []
    const out = {
      pluginsAdded: [],
      middleWaresAdded: [],
      extendedRoutes: [],
      modulesAdded: [],
      templatesAdded: []
    }

    function handleDone () {
      let allDone = true
      Object.entries(out).some(([key, arr]) => {
        if (arr.length < expCnt[key]) {
          allDone = false
          return true
        }
      })
      if (allDone) {
        out.cssAdded = simpleNuxt.options.css
        resolve(out)
      }
    }

    const modContainer = {
      extendRoutes (fn) {
        try {
          fn(sampleRoutes, path.resolve)
        } catch (err) {
          reject(err)
        }
        out.extendedRoutes = sampleRoutes
        handleDone()
      }
    }
    const simpleNuxt = {
      addModule (modName) {
        out.modulesAdded.push(modName)
        handleDone()
      },
      addPlugin (pluginOpts) {
        out.pluginsAdded.push(pluginOpts)
        handleDone()
      },
      addServerMiddleware (middleWareOpts) {
        out.middleWaresAdded.push(middleWareOpts)
        handleDone()
      },
      addTemplate (templateOpts) {
        out.templatesAdded.push(templateOpts)
      },
      options: {
        css: [],
        srcDir,
        modules,
        io,
        server
      },
      nuxt: {
        hook (evt, fn) {
          if (evt === 'modules:done') {
            fn(modContainer).catch(reject)
          }
        }
      },
      NuxtStoriesMod
    }

    simpleNuxt.NuxtStoriesMod(modOptions)

    delay(timeout).then(() => {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject({
        message: 'loadModule timeout',
        pluginsAdded: out.pluginsAdded,
        sampleRoutes
      })
    })
  })
}

test('Stories Module (defaults)', async (t) => {
  const modOptions = getModuleOptions(config, 'lib/stories.module')
  modOptions.forceBuild = true
  const expCnt = {
    pluginsAdded: 1,
    middleWaresAdded: 1,
    extendedRoutes: 1,
    modulesAdded: 2
  }
  const out = await loadModule({ modOptions, expCnt })
  t.true(out.templatesAdded.length > 0)
})

test('Stories Module (staticHost)', async (t) => {
  const modOptions = getModuleOptions(config, 'lib/stories.module')
  modOptions.staticHost = true
  modOptions.forceBuild = true
  const expCnt = {
    pluginsAdded: 1,
    middleWaresAdded: 1,
    extendedRoutes: 1,
    modulesAdded: 1
  }
  const out = await loadModule({ modOptions, expCnt })
  t.true(out.templatesAdded.length > 0)
})

test('Module bails if mode is not dev and forceBuild is false', async (t) => {
  process.env.NODE_ENV = 'production'
  const modOptions = {
    forceBuild: false,
    storiesDir: 'stories'
  }
  const expCnt = {
    pluginsAdded: 1,
    middleWaresAdded: 1,
    extendedRoutes: 1,
    modulesAdded: 2
  }
  const server = {
    host: 'localhost',
    port: 3003
  }

  await loadModule({ modOptions, expCnt, server }).catch((err) => {
    t.is(err.message, 'loadModule timeout')
    t.is(err.pluginsAdded.length, 0)
    t.is(err.sampleRoutes.length, 0)
  })
})
