/*
 * nuxt-stories module (https://www.npmjs.com/package/nuxt-stories)
   Copyright 2021 Richard Schloss (https://github.com/richardeschloss)
   Licensed under MIT (https://github.com/richardeschloss/nuxt-stories/blob/master/LICENSE)
 */
/* eslint-disable node/no-deprecated-api */
import Debug from 'debug'
import { readdirSync, readFileSync } from 'fs'
import { resolve as pResolve } from 'path'
import { URL } from 'url'
import serveStatic from 'serve-static'
import { register as ioRegister } from 'nuxt-socket-io/lib/module.js'
import DB from './store/db.server.js'

const debug = Debug('nuxt-stories')

export let db

export const register = Object.freeze({
  async db ({ srcDir }) {
    db = DB({ srcDir })
    await db.load()
  },
  hooks(ctx, obj) {
    Object.entries(obj).forEach(([hook, cb]) => {
      ctx.nuxt.hook(hook, cb)
    })
  },
  /**
   * @typedef ioOptsT
   * @prop {String} [url]
   * @prop {String} [host]
   * @prop {String|Number} [port]
   */
  /**
   * @param {import('@nuxt/types').NuxtConfig} ctx 
   * @param {ioOptsT} ioOpts 
   * @param {*} [server]
   */
  async io (ctx, ioOpts = {}, server) {
    const useOpts = {}

    if (ioOpts.url) {
      const { host, port, protocol } = new URL(ioOpts.url)
      Object.assign(ioOpts, { host, port, proto: protocol })
    }

    // IO server
    if (ctx.options.server && ctx.options.server.port) {
      const { host, port, https } = ctx.options.server
      const proto = https ? 'https' : 'http'
      Object.assign(useOpts, { host, port: port + 1 })
      useOpts.ioSvc = pResolve(__dirname, 'io.js')
      useOpts.cors = {
        origin: `${proto}://${host}:${port}`,
        methods: ['GET', 'POST']
      }
      useOpts.proto = proto
      await ioRegister.server(useOpts, server)
        .catch((err) => {
          // console.log('caught err! EADDRINUSE', err)
        })
    }

    // IO client
    if (!ctx.options.io) {
      ctx.options.io = {}
    }

    if (!ctx.options.io.sockets) {
      ctx.options.io.sockets = []
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
      ctx.options.io.sockets.push(storiesSocket)
    }
  },
  middlewares (ctx, storiesDir, staticHost = {}) {
    const { mount = '/nuxtStories' } = staticHost
    const middlewares = [
      // Example: fetch /nuxtStories/stories.db  
      { path: mount, handler: serveStatic(`./${storiesDir}`) },
      { 
        path: '/nuxtStories/svg', 
        handler: serveStatic(pResolve(__dirname, 'assets/svg'))
      },
      {
        path: '/nuxtStories/README.md',
        handler(_, res, next) {
          res.write(readFileSync(pResolve('.', 'README.md')))
          res.end()
          next()
        }
      }
    ]
    debug('registered middlewares', middlewares)

    middlewares.forEach((middleware) => {
      ctx.addServerMiddleware(middleware)
    })
    return middlewares.map(({path}) => path)
  },
  modules (ctx, mods = []) {
    mods.forEach((mod) => {
      if (!ctx.options.modules.includes(mod)) {
        ctx.addModule(mod)
      }
    })
  },
  plugins (ctx, plugins) {
    plugins.forEach((plugin) => {
      ctx.addPlugin(plugin)
    })
    return plugins.map(({ fileName }) => fileName)
  },
  templates (ctx, { dirs = [], files = [] }) {
    dirs.forEach((dir) => {
      const files = readdirSync(pResolve(__dirname, dir))
      files.forEach((f) => {
        ctx.addTemplate({
          src: pResolve(__dirname, dir, f),
          fileName: `nuxt-stories/${dir}/${f}`
        })
      })
    })
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
      rootComponent = pResolve(__dirname, 'components/Root.js'),
      markdownComp = pResolve(__dirname, 'components/Markdown.vue'),
      storiesDepth = 2
    } = cfg
    
    return {
      name: storiesDir,
      path: `/${storiesDir}`,
      chunkName: storiesDir,
      component: rootComponent,
      children: [{
        name: 'Markdown',
        path: ':lang?/*',
        component: ''
      }]
    }
  },
  async stories (lang) {
    return await db.buildTree(lang)
  }
})

/** @param {import('./types').moduleOptions} moduleOptions*/
export default async function (moduleOptions) {
  const options = { ...this.options.stories, ...moduleOptions }
  const {
    forceBuild,
    lang = 'en',
    storiesDir = 'stories',
    storiesAnchor = storiesDir,
    ioOpts,
    staticHost,
    fetch: _fetch = true,
    dynamicImport,
    watchStories = !staticHost,
    inputDebounceMs = 350,
    titleDebounceMs = 700
  } = options

  if (process.env.NODE_ENV !== 'development' && !forceBuild) { return }

  debug('nuxt stories module enabled')
  const { srcDir } = this.options
  const cfgOptions = {
    storiesDir,
    storiesAnchor,
    lang,
    ioOpts,
    staticHost,
    fetch: _fetch,
    dynamicImport,
    watchStories,
    inputDebounceMs,
    titleDebounceMs
  }
  
  this.options.build.transpile.push('les-utils/utils/promise.js')
  
  register.hooks(this, {
    'components:dirs'(dirs) {
      dirs.push({
        path: pResolve(__dirname, 'components'),
        prefix: 'NuxtStories'
      })
    },
    'modules:done': async (moduleContainer) => {
      register.templates(this, {
        dirs: ['assets/svg', 'components', 'utils', 'store']
      })
      cfgOptions.middlewares = register.middlewares(this, storiesDir, staticHost)
      cfgOptions.plugins = register.plugins(this, [{
        ssr: true,
        src: pResolve(__dirname, 'plugin.js'),
        fileName: 'nuxt-stories/plugin.js'
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
      cfgOptions.modulesAdded = mods
    
      this.options.publicRuntimeConfig.nuxtStories = { ...cfgOptions }
      moduleContainer.extendRoutes((routes) => {
        routes.push(cfgOptions.routes)
      })
    } 
  })

  const mods = []
  if (!staticHost) {
    await register.io(this, ioOpts)
    mods.push('nuxt-socket-io')
  }
  register.modules(this, mods)
}
