/* eslint-disable no-console */
import Debug from 'debug'
import Json from 'vue-json-pretty'
import TestRunner from './components/TestRunner.js'
import TestCoverage from './components/TestCoverage.js'
import Readme from './components/Readme.js'
import { defineNuxtPlugin, useState } from '#app'

const debug = Debug('nuxt-stories')

const components = { Json, TestRunner, TestCoverage, Readme }

export const nuxtStories = () => useState('$nuxtStories', () => ({
  activeStory: null,
  stories: [],
  toc: [],
  viewModes: ['view', 'edit', 'split'],
  viewMode: '',
  fetched: {}
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
  const { staticHost } = $config.nuxtStories

  nuxtApp.vueApp.config.errorHandler = (err, vm, info) => {
    /* TBD: error handling (issue/69) */
    // For example, can by thrown by: {{ $route }},
    // which can be likely, if someone intends to type "{{ $route.path }}"

    debug('Vue error', err.message, vm, info)
    if (info === 'render') {
      // We re-throw the error again so that the page still stays alive,
      // but the user sees the error message in the dev console.
      // Otherwise, the page would just keep on crashing without a graceful means to exit.
      throw new Error(err)
    }
  }

  nuxtApp.vueApp.config.warnHandler = (err, vm, info) => {
    // Vue complains about performance overhead by compiling on the fly
    // But we don't want to make the refs shallow. We want the full reactivity
    // since we're designing components.
    debug('Vue warning', err, vm, info)

    // Mute VueJsonPretty warnings (especially for json with functions)
    if (info && info.includes('VueJsonPretty')) {
      // eslint-disable-next-line no-useless-return
      return
    } else if (err.message.includes('Error compiling template')) {
      // Yeah, we know, we're compiling on the fly...
      debug(err, vm, info)
      throw new Error(err)
    }
  }
  nuxtApp.provide('nuxtStories', nuxtStories)

  Object.entries(components).forEach(([name, comp]) => {
    if (!nuxtApp.vueApp.component(name)) {
      nuxtApp.vueApp.component(name, comp.default || comp)
    }
  })

  if (staticHost) {
    const db = await register.db()
    Object.defineProperty($config.nuxtStories, 'db', {
      writable: false,
      value: db
    })
  }
})
