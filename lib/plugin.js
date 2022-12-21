/* eslint-disable no-console */
import Debug from 'debug'
import Json from 'vue-json-pretty'
// import StoriesLayout from './layouts/stories.js'
import TestRunner from './components/TestRunner.js'
import TestCoverage from './components/TestCoverage.js'
import Readme from './components/Readme.js'
import { defineNuxtPlugin, useState } from '#app'

const debug = Debug('nuxt-stories')

const components = {
  Json,
  TestRunner,
  TestCoverage,
  Readme
}

export const nuxtStories = () => useState('$nuxtStories', () => ({
  compiledVue: false,
  stylingSelector: null,
  styles: {},
  activeStory: null,
  stories: [],
  toc: [],
  viewModes: ['view', 'edit', 'split'],
  viewMode: '',
  fetched: {},
  showOverflow: false
}))

export const register = Object.freeze({
  async db () {
    debug('[plugin] register db.client')
    const DB = (await import('./store/db.client.js')).default
    const db = DB({})
    await db.load()
    return db
  }
})

export default defineNuxtPlugin(async (nuxtApp) => {
  const { $config } = nuxtApp.vueApp.$nuxt
  const { staticHost } = $config.public.nuxtStories

  nuxtApp.vueApp.config.errorHandler = (err, vm, info) => {
    /* TBD: error handling (issue/69) */
    // For example, can by thrown by: {{ $route }},
    // which can be likely, if someone intends to type "{{ $route.path }}"

    debug('Vue error', err.message, vm, info)
    if (info === 'render') {
      // We re-throw the error again so that the page still stays alive,
      // but the user sees the error message in the dev console.
      // Otherwise, the page would just keep on crashing without a graceful means to exit.
      nuxtApp.vueApp.$nuxt.$nuxtStories().value.compilationError = err.message
      // throw new Error(err)
    }
  }

  nuxtApp.vueApp.config.warnHandler = (err, vm, info) => {
    // Vue complains about performance overhead by compiling on the fly
    // But we don't want to make the refs shallow. We want the full reactivity
    // since we're designing components.
    if (err.includes('Vue received a Component which was made a reactive object')) {
      nuxtApp.vueApp.$nuxt.$nuxtStories().value.compilationError = null
      return
    }

    // Mute VueJsonPretty warnings (especially for json with functions)
    if (info && info.includes('VueJsonPretty')) {
      // eslint-disable-next-line no-useless-return
      return
    } else if (err.match(/Template compilation error|not defined on instance/)) {
      // Yeah, we know, we're compiling on the fly...
      nuxtApp.vueApp.$nuxt.$nuxtStories().value.compilationError = err
    } else {
      console.warn(err, vm, info)
    }
  }
  nuxtApp.provide('nuxtStories', nuxtStories)

  Object.entries(components).forEach(([name, comp]) => {
    if (!(name in nuxtApp.vueApp._context.components)) {
      const useComp = comp.default || comp
      // useComp.name = 'AsyncComponentWrapper' // TBD: a fake name to get it showing up in Component Browser
      nuxtApp.vueApp.component(name, useComp)
    }
  })

  if (staticHost && process.client) {
    const db = await register.db()
    Object.defineProperty($config.public.nuxtStories, 'db', {
      get () {
        return db
      }
    })
  }
})
