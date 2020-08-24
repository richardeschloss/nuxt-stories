import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve as pResolve } from 'path'
import { promisify } from 'util'
import { parse as urlParse } from 'url'
import Glob from 'glob'
import { createRoutes } from '@nuxt/utils'
import serveStatic from 'serve-static'
import { register as ioRegister } from 'nuxt-socket-io'
import Markdown from './utils/markdown.server'

const glob = promisify(Glob)
let _modOptions

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

export const storyPath = mdPath => `${_modOptions.srcDir}/${mdPath}`
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
  const srcDirResolved = pResolve(srcDir).replace(/\\\\/g, '/')
  return createRoutes({
    supportedExtensions: ['vue', 'js', 'md'],
    files: files.map(f => f.replace(`${srcDirResolved}/`, '')),
    pagesDir: storiesDir,
    srcDir
  }).map((route, idx) => mapRoute(route, [ startIdx + idx ]))
}

export const register = Object.freeze({
  css (ctx, codeStyle) {
    ctx.options.css.push(`highlight.js/styles/${codeStyle}.css`)
  },
  io ({ ctx, ioOpts = {}, server }) {
    const useOpts = {}

    if (ioOpts.url) {
      const { host, port } = urlParse(ioOpts.url)
      Object.assign(ioOpts, { host, port })
    }

    // IO server
    if (ctx.options.server && ctx.options.server.port) {
      const { host, port } = ctx.options.server
      Object.assign(useOpts, { host, port: port + 1 })
      useOpts.ioSvc = pResolve(__dirname, 'stories.io')
      ioRegister.server(useOpts, server)
    }

    // IO client
    if (!ctx.options.io) {
      ctx.options.io = {}
    }

    if (!ctx.options.io.sockets) {
      ctx.options.io.sockets = []
    }

    Object.assign(useOpts, ioOpts)
    if (useOpts.host) {
      const url = useOpts.url || `${useOpts.host}:${useOpts.port}`
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
  options (modOptions) {
    _modOptions = { ...modOptions }
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
  async routes (cfg) {
    cfg.srcDir = _modOptions.srcDir
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
        const contents = readFileSync(component)
        const { frontMatter } = Markdown.parse(contents)
        story.mdPath = `${story.path}.md`
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
