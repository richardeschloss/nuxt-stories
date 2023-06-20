import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  components: {
    global: true,
    dirs: ['~/components']
  },
  modules: [
    '~/lib/module.js'
  ],
  stories: {
    forceBuild: true,
    watchStories: process.env.NODE_ENV !== 'production',
    staticHost: process.env.NODE_ENV === 'production',
    versions: [{
      version: '3.x (current)'
    }, {
      version: '2.x',
      url: 'https://deploy-preview-93--nuxt-stories.netlify.app/stories'
    }]
  },
  telemetry: false
})
