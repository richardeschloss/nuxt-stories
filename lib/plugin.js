/* eslint-disable no-console */
import Debug from 'debug'
import Json from 'vue-json-pretty'
import TestRunner from './components/TestRunner.js'
import TestCoverage from './components/TestCoverage.js'
import Readme from './components/Readme.js'
// import { state, mutations, actions } from './store/nuxtStories.js'
import { defineNuxtPlugin } from '#app'

const debug = Debug('nuxt-stories')

const components = { Json, TestRunner, TestCoverage, Readme }

export const register = Object.freeze({
  async db () {
    debug('[plugin] register db.client')
    const DB = (await import('./store/db.client.js')).default
    const db = DB({})
    await db.load()
    return db
  },
  routeGuards (router, $config) {
    debug('[plugin] register route guards')
    const { storiesAnchor, lang } = $config.nuxtStories
    router.beforeEach((to, _, next) => {
      // If we navigate to the stories routes and lang param
      // is not defined...
      if (to.path.startsWith(`/${storiesAnchor}`) && !to.params.lang) {
        const pathParts = to.path.slice(1).split('/')
        // If we are at "/stories" want to forward to "/stories/en/"
        // so that lang param gets defined
        if (pathParts.length === 1) {
          // Use default language
          router.push(`/${pathParts[0]}/${lang}/`)
        }
        // If we navigate to "/stories/en" forward to "/stories/en/"
        // so that lang param gets defined
        else if (pathParts.length === 2) {
          const useLang = pathParts[1] !== '' ? pathParts[1] : lang
          router.push(`/${pathParts[0]}/${useLang}/`)
        }
      }
      next()
    })
  }
})

export default defineNuxtPlugin(async (nuxtApp) => {
  // console.log('nuxtApp', nuxtApp)
  return
  const { app, $config, store } = nuxtApp.nuxt2Context
  // store.registerModule(
  //   '$nuxtStories',
  //   {
  //     namespaced: true,
  //     state: state(),
  //     mutations,
  //     actions
  //   }
  // )

  Object.entries(components).forEach(([name, comp]) => {
    nuxtApp.vueApp.component(name, comp.default || comp)
  })
  const { staticHost } = $config.nuxtStories
  register.routeGuards(app.router, $config)

  if (staticHost) {
    const db = await register.db()
    Object.defineProperty($config.nuxtStories, 'db', {
      writable: false,
      value: db
    })
  }
})
