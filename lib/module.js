/*
 * nuxt-stories module (https://www.npmjs.com/package/nuxt-stories)
   Copyright 2022 Richard Schloss (https://github.com/richardeschloss)
   Licensed under MIT (https://github.com/richardeschloss/nuxt-stories/blob/master/LICENSE)
 */
/* eslint-disable node/no-deprecated-api */
import { existsSync, writeFileSync } from 'fs'
import { resolve as pResolve } from 'path'
import Debug from 'debug'
import serveStatic from 'serve-static'
import { fromNodeMiddleware } from 'h3'
import { defineNuxtModule, addPlugin, addLayout, addDevServerHandler, extendPages, installModule } from '@nuxt/kit'
import { register as ioRegister } from 'nuxt-socket-io/lib/module.js'
import DB from './store/db.server.js'

const debug = Debug('nuxt-stories')

// eslint-disable-next-line import/no-mutable-exports
export let db // TBD

function includeDeps (nuxt, deps) {
  /* c8 ignore start */
  if (!nuxt.options.vite) {
    nuxt.options.vite = {}
  }

  if (!nuxt.options.vite.optimizeDeps) {
    nuxt.options.vite.optimizeDeps = {}
  }
  if (!nuxt.options.vite.optimizeDeps.include) {
    nuxt.options.vite.optimizeDeps.include = []
  }
  nuxt.options.vite.optimizeDeps.include.push(...deps)
  /* c8 ignore stop */
}

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
      const { hostname: host, port, protocol } = new URL(ioOpts.url)
      Object.assign(useOpts, { host, port, proto: protocol })
    }

    if (nuxt?.options?.devServer?.port) {
      const { host, port, https } = nuxt.options.devServer
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
        debug('caught err! EADDRINUSE', err)
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

    /** @type Array<import('nitropack/dist').NitroDevEventHandler> */
    const middlewares = [
      // Example: fetch /nuxtStories/stories.db
      {
        route: mount,
        handler: fromNodeMiddleware((req, res, next) => serveStatic(`./${storiesDir}`)(req, res, next))
      },
      {
        route: '/nuxtStories/svg', // If file not in in public/ then we pull from here...
        handler: fromNodeMiddleware((req, res, next) => serveStatic(pResolve(__dirname, 'assets/svg'), {
          maxAge: '1d'
        })(req, res, next))
      },
      {
        route: '/nuxtStories/coverage',
        handler: fromNodeMiddleware((req, res, next) => serveStatic(pResolve('./coverage'))(req, res, next))
      }
    ]
    debug('registered middlewares', middlewares)

    middlewares.forEach((middleware) => {
      addDevServerHandler(middleware)
    })
    return middlewares.map(({ route }) => route)
  },
  modules (nuxt, mods = []) {
    const p = mods.map(async (mod) => {
      if (!nuxt.options.modules.includes(mod)) {
        nuxt.options.modules.push(mod)
        await installModule(mod, {}, nuxt)
      }
    })
    return Promise.all(p)
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
   * @prop {string} [langComponent]
   * @prop {string} [storyComponent]
   *
   * @param {RoutesCfg} cfg
   */
  routes (cfg) {
    const {
      storiesDir,
      rootComponent = pResolve(__dirname, 'components', 'Root.js'),
      langComponent = pResolve(__dirname, 'components', 'Placeholder.js'),
      storyComponent = pResolve(__dirname, 'components', 'Placeholder.js')
    } = cfg

    return {
      name: storiesDir,
      path: `/${storiesDir}`,
      file: rootComponent,
      meta: {
        // Prefer a layout to keep certain things like header and sidebar fixed
        // when routes change to different stories. Otherwise, we get this annoying flickering
        // with the header and sidebar re-rendering again and scrollbars resetting.
        layout: 'stories'
      },
      children: [{
        name: 'Language',
        path: ':lang',
        file: langComponent,
        meta: {},
        children: [{
          name: 'Story',
          path: ':catchAll(.*)*',
          file: storyComponent,
          meta: {}
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
      titleDebounceMs = 700,
      appliedStyles = pResolve(__dirname, 'assets/css/appliedStyles.css'),
      ...rest
    } = options

    if (process.env.NODE_ENV !== 'development' && !forceBuild) { return }

    // addLayout({
    //   src: pResolve(__dirname, 'layouts', 'stories.js')
    // }, 'stories')

    debug('nuxt stories module enabled')
    if (!existsSync(appliedStyles)) {
      writeFileSync(appliedStyles, '')
    }
    nuxt.options.css.push(appliedStyles) // TBD
    nuxt.options.build.transpile.push(__dirname)
    includeDeps(nuxt, [
      'vue/dist/vue.esm-bundler.js', 'ieee754', 'base64-js', 'highlight.js', 'gray-matter', 'vue-json-pretty'
    ])
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
      titleDebounceMs,
      appliedStyles,
      ...rest
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
    cfgOptions.routes = register.routes({ storiesDir, ...rest })

    const mods = []
    if (watchStories) {
      debug('target is "server"...Registering io server for storiesSocket')
      await register.ioServer(nuxt, ioOpts)
    }

    if (!staticHost) {
      await register.ioClient(nuxt, ioOpts)
      mods.push('nuxt-socket-io')
    }
    await register.modules(nuxt, mods)
    cfgOptions.modulesAdded = mods
    nuxt.options.runtimeConfig.public.nuxtStories = { ...cfgOptions }
    extendPages((pages) => {
      pages.push(nuxt.options.runtimeConfig.public.nuxtStories.routes)
    })
    nuxt.hook('components:dirs', (dirs) => {
      dirs.push({
        global: true,
        path: pResolve(__dirname, 'components'),
        prefix: 'NuxtStories'
      })
    })
  }
})
