/** @type {import('./lib/types').moduleOptions} */
const storiesOpts = {  
  dynamicImport: true,
  forceBuild: true,
  staticHost: process.env.NODE_ENV === 'production',
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
  watch: ['~/lib/*.js', '~/README.md'],
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend (config, ctx) {},
    // parallel: true,
    // cache: true,
    // hardSource: true
  }
}
