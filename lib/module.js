/*
 * nuxt-stories module (https://www.npmjs.com/package/nuxt-stories)
   Copyright 2022 Richard Schloss (https://github.com/richardeschloss)
   Licensed under MIT (https://github.com/richardeschloss/nuxt-stories/blob/master/LICENSE)
 */
/* eslint-disable node/no-deprecated-api */
import { readFileSync } from 'fs'
import { resolve as pResolve } from 'path'
import Debug from 'debug'
import serveStatic from 'serve-static'
import { defineNuxtModule, addPlugin, addServerMiddleware, extendPages, installModule } from '@nuxt/kit'
import { register as ioRegister } from 'nuxt-socket-io/lib/module.js'
import DB from './store/db.server.js'

const debug = Debug('nuxt-stories')

// eslint-disable-next-line import/no-mutable-exports
export let db // TBD

export const register = Object.freeze({
  async db ({ srcDir }) {
    db = DB({ srcDir })
    await db.load()
  },
  /**
   * @typedef ioOptsT
   * @prop {String} [url]
   * @prop {String} [host]
   * @prop {String|Number} [port]
   * @prop {*} [cors]
   */
  /**
   * @param {import('@nuxt/types').NuxtConfig} ctx
   * @param {ioOptsT} ioOpts
   * @param {*} [server]
   */
  async ioServer (nuxt, ioOpts = {}, server) {
    const useOpts = {}

    if (ioOpts.url) {
      // Parse host and port from ioOpts
      const { host, port, protocol } = new URL(ioOpts.url)
      Object.assign(useOpts, { host, port, proto: protocol })
    }

    if (nuxt?.options?.server?.port) {
      const { host, port, https } = nuxt.options.server
      const proto = https ? 'https' : 'http'
      useOpts.cors = {
        origin: `${proto}://${host}:${port}`,
        methods: ['GET', 'POST']
      }
      Object.assign(useOpts, { host, port: port + 100, proto })
    }
    useOpts.ioSvc = pResolve(__dirname, 'io.js')

    // Provide ioOpts override everything else...
    Object.assign(useOpts, ioOpts)

    debug('register io server', useOpts)
    await ioRegister.server(useOpts, server)
      // eslint-disable-next-line node/handle-callback-err
      .catch((err) => {
      // console.log('caught err! EADDRINUSE', err)
      })
  },

  /**
   * @param {import('@nuxt/types').NuxtConfig} ctx
   * @param {ioOptsT} ioOpts
   * @param {*} [server]
   */
  ioClient (nuxt, ioOpts = {}) {
    const useOpts = {}

    if (ioOpts.url) {
      const { host, port, protocol } = new URL(ioOpts.url)
      Object.assign(ioOpts, { host, port, proto: protocol })
    }

    if (nuxt?.options?.server?.port) {
      const { host, port, https } = nuxt.options.server
      useOpts.proto = https ? 'https' : 'http'
      Object.assign(useOpts, { host, port: port + 100 })
    } else {
      Object.assign(useOpts, {
        host: 'localhost',
        port: 3100
      })
    }

    // IO client
    if (!nuxt.options.io) {
      nuxt.options.io = {}
      if (nuxt.options.target === 'static') {
        nuxt.options.io.server = false
      }
    }

    if (!nuxt.options.io.sockets) {
      nuxt.options.io.sockets = []
    }

    Object.assign(useOpts, ioOpts)
    if (useOpts.proto === undefined) {
      useOpts.proto = 'http'
    }
    if (useOpts.host) {
      const url = useOpts.url || `${useOpts.proto}://${useOpts.host}:${useOpts.port}`
      const storiesSocket = {
        name: 'nuxtStories',
        url
      }
      debug('storiesSocket registered', storiesSocket)
      nuxt.options.io.sockets.push(storiesSocket)
    }
  },
  middlewares (storiesDir, staticHost = {}) {
    const { mount = '/nuxtStories' } = staticHost
    const middlewares = [
      // Example: fetch /nuxtStories/stories.db
      { path: mount, handler: serveStatic(`./${storiesDir}`) },
      {
        path: '/nuxtStories/svg',
        handler: serveStatic(pResolve(__dirname, 'assets/svg'), {
          maxAge: '1d'
        })
      },
      {
        path: '/nuxtStories/README.md',
        handler (_, res, next) {
          res.write(readFileSync(pResolve('.', 'README.md')))
          res.end()
          next()
        }
      },
      {
        path: '/nuxtStories/coverage',
        handler: serveStatic(pResolve('./coverage'))
      }
    ]
    debug('registered middlewares', middlewares)

    middlewares.forEach((middleware) => {
      addServerMiddleware(middleware)
    })
    return middlewares.map(({ path }) => path)
  },
  modules (nuxt, mods = []) {
    mods.forEach((mod) => {
      if (!nuxt.options.modules.includes(mod)) {
        installModule(mod, {}, nuxt)
        nuxt.options.modules.push(mod)
      }
    })
  },
  plugins (plugins) {
    plugins.forEach((plugin) => {
      addPlugin(plugin)
    })
    return plugins.map(({ fileName }) => fileName)
  },
  /**
   * @typedef RoutesCfg
   * @prop {string} storiesDir
   * @prop {string} [rootComponent]
   * @prop {string} [markdownComp]
   * @prop {number} [storiesDepth]
   *
   * @param {RoutesCfg} cfg
   */
  routes (cfg) {
    const {
      storiesDir,
      rootComponent = pResolve(__dirname, 'components', 'Root.js')
    } = cfg

    return {
      name: storiesDir,
      path: `/${storiesDir}`,
      file: rootComponent,
      children: [{
        name: 'Language',
        path: ':lang',
        file: pResolve(__dirname, 'components', 'Placeholder.js'),
        children: [{
          name: 'Story',
          path: ':catchAll(.*)*',
          file: pResolve(__dirname, 'components', 'Placeholder.js')
        }]
      }]
    }
  },
  async stories (lang) {
    return await db.buildTree(lang)
  }
})

export default defineNuxtModule({
  /** @param {import('./types').moduleOptions} moduleOptions */
  /** @param {import('@nuxt/types').NuxtConfig} nuxt */
  async setup (moduleOptions, nuxt) {
    const options = { ...nuxt.options.stories, ...moduleOptions }
    const {
      forceBuild,
      lang = 'en',
      storiesDir = 'stories',
      storiesAnchor = storiesDir,
      ioOpts,
      staticHost,
      fetch: _fetch = true,
      watchStories = nuxt.options.target !== 'static',
      inputDebounceMs = 350,
      titleDebounceMs = 700
    } = options

    if (process.env.NODE_ENV !== 'development' && !forceBuild) { return }

    debug('nuxt stories module enabled')
    const { srcDir } = nuxt.options
    const cfgOptions = {
      storiesDir,
      storiesAnchor,
      lang,
      ioOpts,
      staticHost,
      fetch: _fetch,
      watchStories,
      inputDebounceMs,
      titleDebounceMs
    }

    cfgOptions.middlewares = register.middlewares(storiesDir, staticHost)
    cfgOptions.plugins = register.plugins([{
      src: pResolve(__dirname, 'plugin.js')
    }])
    await register.db({ srcDir })
    if (watchStories) {
      await db.watchFS()
    }

    cfgOptions.stories = await register.stories(lang)
    cfgOptions.routes = register.routes({
      storiesDir,
      storiesDepth: Math.max(cfgOptions.stories.depth, 2)
    })

    const mods = []
    if (nuxt.options.target === 'server') {
      debug('target is "server"...Registering io server for storiesSocket')
      await register.ioServer(nuxt, ioOpts)
    }

    if (!staticHost) {
      await register.ioClient(nuxt, ioOpts)
      mods.push('nuxt-socket-io')
    }
    register.modules(nuxt, mods)
    cfgOptions.modulesAdded = mods
    nuxt.options.publicRuntimeConfig.nuxtStories = { ...cfgOptions }
    extendPages((pages) => {
      pages.push(nuxt.options.publicRuntimeConfig.nuxtStories.routes)
    })
  }
})
