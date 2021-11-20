async function staticRoutes () {
  const { promisify } = require('util')
  const Glob = require('glob')
  const glob = promisify(Glob)
  const files = await glob('./stories/**/*.{vue,js,md}')
  const routes = files
    .map(f => f
      .replace('./', '/')
      .replace(/(.js|.vue|.md)/, ''))

  return routes
}

/** @type {import('./lib/types').moduleOptions} */
const storiesOpts = {  
  dynamicImport: true,
  forceBuild: true,
  staticHost: process.env.NODE_ENV === 'production'
}

export default {
  components: true,
  telemetry: false,
  target: process.env.NODE_ENV === 'production'
    ? 'static'
    : 'server',
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || ''
      }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#fff' },
  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/richardeschloss/nuxt-stories
    '~/lib/module.js' // Ok
    // 'nuxt-stories/module.js' // Ok too
  ],
  stories: storiesOpts,
  watch: ['~/lib/*.js'],
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend (config, ctx) {},
    parallel: false,
    cache: false,
    hardSource: false
  },
  generate: {
    dir: 'public',
    routes () {
      return staticRoutes()
    }
  }
}
