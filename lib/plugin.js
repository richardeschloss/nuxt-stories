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
  },
  routeGuards (router, $config) {
    debug('[plugin] register route guards')
    const { storiesAnchor, lang } = $config.nuxtStories
    if (
      router.currentRoute.value.path === '/' ||
      router.currentRoute.value.path === `/${storiesAnchor}` ||
      router.currentRoute.value.path === `/${storiesAnchor}/${lang}`) {
      router.push(`/${storiesAnchor}/${lang}/`)
    }
  }
})

export default defineNuxtPlugin(async (nuxtApp) => {
  const { $router, $config } = nuxtApp.vueApp.$nuxt
  register.routeGuards($router, $config)
  nuxtApp.provide('nuxtStories', nuxtStories)
  return
  // const { app, $config, store } = nuxtApp.nuxt2Context

  Object.entries(components).forEach(([name, comp]) => {
    nuxtApp.vueApp.component(name, comp.default || comp)
  })
  const { staticHost } = $config.nuxtStories

  if (staticHost) {
    const db = await register.db()
    Object.defineProperty($config.nuxtStories, 'db', {
      writable: false,
      value: db
    })
  }
})
