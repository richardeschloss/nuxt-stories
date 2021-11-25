/*
 * nuxt-stories module (https://www.npmjs.com/package/nuxt-stories)
   Copyright 2021 Richard Schloss (https://github.com/richardeschloss)
   Licensed under MIT (https://github.com/richardeschloss/nuxt-stories/blob/master/LICENSE)
 */
/* eslint-disable node/no-deprecated-api */
import Debug from 'debug'
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve as pResolve } from 'path'
import { promisify } from 'util'
import { parse as urlParse, URL } from 'url'
import Glob from 'glob'
import { createRoutes } from '@nuxt/utils'
import serveStatic from 'serve-static'
import { register as ioRegister } from 'nuxt-socket-io/lib/module.js'
import Markdown from './utils/markdown.server.js'

const debug = Debug('nuxt-stories')

const glob = promisify(Glob)
let modOptions

const mdPathTemplate = (depth) => {
  return ':lang?/' +
    Array(depth)
      .fill(0)
      .map((_, idx) => `:L${idx}?`)
      .join('/')
}

const chunkNameTemplate = (depth) => {
  return 'stories/lang/' +
    Array(depth)
      .fill(0)
      .map((_, idx) => `L${idx}`)
      .join('/')
}

const allLangs = ({ srcDir, storiesDir }) => {
  return readdirSync(
    pResolve(srcDir, storiesDir),
    { withFileTypes: true }
  ).filter(d => d.isDirectory())
    .map(({ name }) => name)
}

export const storyPath = mdPath => `${modOptions.srcDir}/${mdPath}`
  .replace(/\\/g, '/')

function mapRoute (route, idxs) {
  const markdownComp = pResolve(__dirname, 'components/StoryMarkdown.vue')
  const lang = route.chunkName.split('/')[1]
  if (idxs.length === 1) {
    route.path = route.path.slice(1)
  }

  route.meta = {
    lang,
    idxs
  }

  if (route.component.endsWith('.md')) {
    route.component = markdownComp
  }

  if (route.children) {
    route.children = route.children
      .map((child, cIdx) => mapRoute(child, [ ...idxs, cIdx ]))
  }
  return route
}

async function buildRoutes ({ srcDir, storiesDir, lang, pattern, startIdx = 0 }) {
  const files = await glob(`${srcDir}/${storiesDir}/${pattern}`)
  const srcDirResolved = pResolve(srcDir).replace(/\\/g, '/')
  return createRoutes({
    supportedExtensions: ['vue', 'js', 'md'],
    files: files.map(f => f.replace(`${srcDirResolved}/`, '')),
    pagesDir: storiesDir,
    srcDir
  }).map((route, idx) => mapRoute(route, [ startIdx + idx ]))
}

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
    const { mount = '/markdown' } = staticHost
    const middlewares = [
      { path: mount, handler: serveStatic(`./${storiesDir}`) }
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
  async routes (cfg) {
    cfg.srcDir = modOptions.srcDir
    const {
      srcDir,
      lang,
      storiesDir,
      storiesAnchor,
      anchorComponent = pResolve(__dirname, 'components/StoriesRoot.vue'),
      markdownComp = pResolve(__dirname, 'components/StoryMarkdown.vue'),
      storiesDepth = 2,
      staticHost
    } = cfg

    const langs = allLangs(cfg)

    const routes = {
      name: storiesAnchor,
      path: `/${storiesAnchor}`,
      chunkName: storiesAnchor,
      component: anchorComponent,
      children: []
    }

    const vueRoutes = await buildRoutes({
      pattern: '**/*.{vue,js}',
      ...cfg
    })
    const mdRoutes = await buildRoutes({
      pattern: '**/*.md',
      startIdx: vueRoutes.length,
      ...cfg
    })

    const dynamicMdRoute = {
      name: 'Markdown',
      path: mdPathTemplate(storiesDepth),
      chunkName: chunkNameTemplate(storiesDepth),
      component: markdownComp
    }

    routes.children.push(
      ...vueRoutes,
      dynamicMdRoute
    )

    let stories

    if (!staticHost) {
      const vueStories = register.stories({
        routes: vueRoutes,
        storiesDir,
        lang
      })
      const mdStories = register.stories({
        routes: mdRoutes,
        storiesDir,
        lang,
        startIdx: vueStories.length,
        markdown: true
      })
      stories = [ ...vueStories, ...mdStories ]
    } else {
      const allStories = {}
      langs.forEach((l) => {
        const vueStories = register.stories({
          routes: vueRoutes,
          storiesDir,
          lang: l
        })
        const mdStories = register.stories({
          routes: mdRoutes,
          storiesDir,
          lang: l,
          startIdx: vueStories.length,
          markdown: true
        })
        allStories[l] = [ ...vueStories, ...mdStories ]
      })
      stories = allStories[lang]

      writeFileSync(
        pResolve(srcDir, storiesDir, 'stories.json'),
        JSON.stringify(allStories)
      )
    }

    return { routes, stories }
  },
  stories ({ routes, storiesDir, startIdx = 0, markdown, lang }) {
    function mapStory (route, basePath, idxs) {
      const { name, path, children, component } = route
      const story = {
        name: name.split('-').slice(-1)[0],
        path: `${basePath}/${path}`,
        children: [],
        idxs,
        frontMatter: {}
      }

      if (markdown) {
        story.path = decodeURIComponent(story.path)
        story.mdPath = `${story.path}.md`
        const contents = readFileSync(storyPath(story.mdPath))
        const { frontMatter } = Markdown.parse(contents)
        story.frontMatter = frontMatter
      }
      if (children) {
        story.children = children.map((c, cIdx) => mapStory(c, story.path, [...idxs, cIdx]))
      } else {
        story.children = []
      }
      story.path = `/${story.path}`
      return story
    }
    return routes
      .filter(({ meta }) => meta.lang === lang)
      .map((route, idx) => mapStory(route, storiesDir, [ startIdx + idx ]))
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
    storiesAnchor = storiesDir,
    ioOpts,
    markdown,
    staticHost,
    fetch: _fetch = true,
    dynamicImport
  } = options
  

  if (process.env.NODE_ENV !== 'development' && !forceBuild) { return }

  debug('nuxt stories module enabled')
  const { srcDir } = this.options
  const pOptions = {
    storiesAnchor,
    storiesDir,
    lang,
    codeStyle,
    ioOpts,
    markdown,
    staticHost,
    fetch: _fetch,
    dynamicImport
  }
  modOptions = { srcDir, ...pOptions }

  this.options.build.transpile.push('les-utils/utils/promise.js')

  register.css(this, [
    'bootstrap/dist/css/bootstrap.min.css',
    'bootstrap-icons/font/bootstrap-icons.css',
    `highlight.js/styles/base16/${codeStyle}.css`,
    'vue-json-pretty/lib/styles.css',
    // CSS
    pResolve(__dirname, './assets/css/globals.css'),

    // SCSS
    pResolve(__dirname, './assets/scss/globals.scss')
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

  this.nuxt.hook('components:dirs', (dirs) => {
    dirs.push({
      path: pResolve(__dirname, 'components'),
      prefix: 'NuxtStories'
    })
  })

  this.nuxt.hook('modules:done', async (moduleContainer) => {
    const { routes: storyRoutes, stories } = await register.routes({ ...pOptions })
    pOptions.stories = stories
    this.options.publicRuntimeConfig.nuxtStories = { ...pOptions }
    register.plugins(this, [{
      ssr: true,
      src: pResolve(__dirname, 'plugin.js'),
      fileName: 'nuxt-stories/plugin.js'
    }])

    moduleContainer.extendRoutes((routes) => {
      routes.push(storyRoutes)
    })
  })

  debug('nuxt stories plugin added', pOptions)
}
