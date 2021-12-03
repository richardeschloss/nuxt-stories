/*
 * nuxt-stories module (https://www.npmjs.com/package/nuxt-stories)
   Copyright 2021 Richard Schloss (https://github.com/richardeschloss)
   Licensed under MIT (https://github.com/richardeschloss/nuxt-stories/blob/master/LICENSE)
 */
/* eslint-disable node/no-deprecated-api */
import Debug from 'debug'
import { readdirSync } from 'fs'
import { resolve as pResolve } from 'path'
import { URL } from 'url'
import serveStatic from 'serve-static'
import { register as ioRegister } from 'nuxt-socket-io/lib/module.js'
import DB from './db.server.js'

const debug = Debug('nuxt-stories')

let modOptions = {}
export let db

export const register = Object.freeze({
  /**
   * 
   * @param {import('@nuxt/types').NuxtConfig} ctx 
   * @param {Array<String>} files 
   */
  css (ctx, files) {
    files.forEach((f) => {
      if (!ctx.options.css.includes(f)) {
        ctx.options.css.push(f)
      }
    })
  },
  async db ({ srcDir }) {
    db = DB({ srcDir })
    await db.load()
    await db.initFromFS()
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
      }
    ]

    middlewares.forEach((middleware) => {
      ctx.addServerMiddleware(middleware)
    })
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
        path: ':lang?/' +
          Array(storiesDepth)
            .fill(0)
            .map((_, idx) => `:L${idx}?`)
            .join('/'),
        chunkName: 'stories/lang/' +
          Array(storiesDepth)
            .fill(0)
            .map((_, idx) => `L${idx}`)
            .join('/'),
        component: markdownComp
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
    codeStyle = 'darcula',
    storiesDir = 'stories',
    ioOpts,
    markdown,
    staticHost,
    fetch: _fetch = true,
    dynamicImport
  } = options

  if (process.env.NODE_ENV !== 'development' && !forceBuild) { return }

  debug('nuxt stories module enabled')
  const { srcDir } = this.options
  const cfgOptions = {
    storiesDir,
    storiesAnchor: storiesDir,
    lang,
    codeStyle,
    ioOpts,
    markdown,
    staticHost,
    fetch: _fetch,
    dynamicImport
  }
  Object.assign(modOptions, { srcDir, ...cfgOptions })

  this.options.build.transpile.push('les-utils/utils/promise.js')
  
  register.hooks(this, {
    'components:dirs'(dirs) {
      dirs.push({
        path: pResolve(__dirname, 'components'),
        prefix: 'NuxtStories'
      })
    },
    'modules:done': async (moduleContainer) => {
      await register.db({ srcDir })
      cfgOptions.stories = await register.stories(lang)
      const storyRoutes = register.routes({ 
        storiesDir, 
        storiesDepth: Math.max(cfgOptions.stories.depth, 2)
      })
    
      this.options.publicRuntimeConfig.nuxtStories = { ...cfgOptions }
      moduleContainer.extendRoutes((routes) => {
        routes.push(storyRoutes)
      })
    } 
  })
  register.css(this, [
    // TBD (scope to lib?)
    // `highlight.js/styles/base16/${codeStyle}.css`,
    // 'vue-json-pretty/lib/styles.css',
  ])

  register.templates(this, {
    dirs: ['assets/svg', 'components', 'utils', 'store']
  })

  const mods = []
  if (!staticHost) {
    await register.io(this, ioOpts)
    mods.push('nuxt-socket-io')
  }
  register.modules(this, mods)
  register.middlewares(this, storiesDir, staticHost)
  register.plugins(this, [{
    ssr: true,
    src: pResolve(__dirname, 'plugin.js'),
    fileName: 'nuxt-stories/plugin.js'
  }])

}
