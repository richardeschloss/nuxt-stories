import { defineNuxtConfig } from 'nuxt3'

/** @type {import('./lib/types').moduleOptions} */
const storiesOpts = {
  forceBuild: true,
  staticHost: process.env.NODE_ENV === 'production',
  versions: [{
    version: '3.x (current)'
  }, {
    version: '2.x',
    url: 'https://deploy-preview-93--nuxt-stories.netlify.app/stories'
  }]
}

export default defineNuxtConfig({
  components: [{
    path: '~/lib/components',
    prefix: 'NuxtStories'
  }],
  ssr: process.env.NODE_ENV !== 'production',
  vite: {
    build: {
      chunkSizeWarningLimit: 2e6
    }
  },
  css: [
    '~/lib/assets/css/vendor.min.css'
  ],
  target: process.env.NODE_ENV === 'production'
    ? 'static'
    : 'server',
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
  buildModules: [
    '~/lib/module.js'
  ],
  stories: storiesOpts,
  telemetry: false
})
