/* eslint-disable no-console */
import Debug from 'debug'
import { state, mutations, actions } from './store/nuxtStories.js'

const debug = Debug('nuxt-stories')

export const register = Object.freeze({
  async db(nuxtStories) {
    debug('[plugin] register db.client')
    const DB = (await import('./store/db.client.js')).default
    const db = DB({})
    await db.load()
    Object.defineProperty(nuxtStories, 'db', {
      writable: false,
      value: db
    })
  },
  routeGuards(router, $config) {
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

export default async function({ app, $config, store }) {
  const { lang, storiesDir, staticHost } = $config.nuxtStories
  
  if (!staticHost) {
    register.routeGuards(app.router, $config)
  } else {
    if (process.client) {
      await register.db($config.nuxtStories)
    }
  }
  
  store.registerModule(
    '$nuxtStories',
    {
      namespaced: true,
      state: state(),
      mutations,
      actions
    }
  )
  store.commit('$nuxtStories/SET_LANG', lang)
  store.commit('$nuxtStories/SET_STORIES_DIR', storiesDir)
}
