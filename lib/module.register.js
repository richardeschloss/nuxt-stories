import { readdirSync, readFileSync } from 'fs'
import { resolve as pResolve } from 'path'
import { promisify } from 'util'
import Glob from 'glob'
import { createRoutes } from '@nuxt/utils'
import serveStatic from 'serve-static'
import { register as ioRegister } from 'nuxt-socket-io'
import Markdown from './utils/markdown.server'

const glob = promisify(Glob)

export const register = Object.freeze({
  css (ctx, codeStyle) {
    ctx.options.css.push(`highlight.js/styles/${codeStyle}.css`)
  },
  io (ctx, server) {
    const { port, host } = ctx.options.server
    const ioPort = port + 1
    ioRegister.server({
      port: ioPort,
      ioSvc: pResolve(__dirname, 'stories.io')
    }, server)
    if (!ctx.options.io) {
      ctx.options.io = {}
    }

    if (!ctx.options.io.sockets) {
      ctx.options.io.sockets = []
    }
    const url = `${host}:${ioPort}`
    const storiesSocket = {
      name: 'nuxtStories',
      url
    }
    ctx.options.io.sockets.push(storiesSocket)
  },
  middlewares (ctx, storiesDir) {
    const middlewares = [
      { path: '/markdown', handler: serveStatic(`./${storiesDir}`) }
    ]

    middlewares.forEach((middleware) => {
      ctx.addServerMiddleware(middleware)
    })
  },
  modules (ctx, mods = [], server) {
    if (mods.includes('nuxt-socket-io')) {
      register.io(ctx, server)
    }

    mods.forEach((mod) => {
      if (!ctx.options.modules.includes(mod)) {
        ctx.addModule(mod)
      }
    })
  },
  plugins (ctx, pOptions) {
    const plugins = [
      {
        ssr: true,
        src: pResolve(__dirname, 'stories.plugin.js'),
        fileName: 'nuxt-stories/plugin.js',
        options: pOptions
      }
    ]
    plugins.forEach((plugin) => {
      ctx.addPlugin(plugin)
    })
  },
  templates (ctx, { dirs, files }) {
    dirs.forEach((dir) => {
      const files = readdirSync(pResolve(__dirname, dir))
      files.forEach((f) => {
        ctx.addTemplate({
          src: pResolve(__dirname, dir, f),
          fileName: `nuxt-stories/${dir}/${f}`
        })
      })
    })

    files.forEach((f) => {
      ctx.addTemplate({
        src: pResolve(__dirname, f),
        fileName: `nuxt-stories/${f}`
      })
    })
  },
  async mdRoutes ({ srcDir, lang, storiesDir, storiesAnchor, startIdx }) {
    const files = await glob(`${srcDir}/${storiesDir}/${lang}/**/*.md`)
    const srcDirResolved = pResolve(srcDir).replace(/\\\\/g, '/')
    const staticDir = 'markdown'
    const routes = createRoutes({
      supportedExtensions: ['md'],
      files: files.map(f => f.replace(`${srcDirResolved}/`, '')),
      pagesDir: storiesDir,
      srcDir
    })

    function mapRoute (route, idxs) {
      route.name = route.name.replace('.md', '')
      const parts = route.path.split('/')
      const mdPath = route.component.replace(pResolve(srcDirResolved, storiesDir), staticDir)
      const contents = readFileSync(route.component)
      const { toc, compiled, frontMatter } = Markdown.parse(contents)
      
      route.path = parts[parts.length - 1].replace('.md', '')
      route.chunkName = route.chunkName.replace('.md', '')

      route.meta = {
        mdSavePath: route.component,
        mdPath,
        idxs,
        frontMatter
      }

      route.component = pResolve(__dirname, 'components/StoryMarkdown.vue')
      if (route.children) {
        route.children.forEach((route, childIdx) => mapRoute(route, [...idxs, childIdx]))
      }
    }

    routes.forEach((route, idx) => mapRoute(route, [idx + startIdx]))
    return routes
  },
  async vueRoutes ({ srcDir, lang, storiesDir, storiesAnchor }) {
    const files = await glob(`${srcDir}/${storiesDir}/${lang}/**/*.{vue,js}`)
    const srcDirResolved = pResolve(srcDir).replace(/\\\\/g, '/')
    const [routes] = createRoutes({
      files: files.map(f => f.replace(`${srcDirResolved}/`, '')),
      pagesDir: storiesDir,
      srcDir
    })
    if (!routes) {
      throw new Error(
        `Error: Story routes not created. Does the stories directory "${storiesDir}" exist?`
      )
    }
    routes.name = storiesAnchor
    routes.path = `/${routes.name}`
    return routes
  },
  async routes (cfg) {
    const vueRoutes = await register.vueRoutes(cfg).catch(console.error)
    if (vueRoutes.children === undefined) {
      vueRoutes.children = []
    }

    const mdRoutes = await register.mdRoutes({
      ...cfg,
      startIdx: vueRoutes.children.length
    })
    vueRoutes.children.push(...mdRoutes)
    return vueRoutes
  }
})
