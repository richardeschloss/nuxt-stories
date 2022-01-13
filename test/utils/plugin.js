import { reactive, toRef, isReactive } from 'vue'
const ctx = {
  vueApp: {
    config: {},
    $nuxt: {},
    components: {},
    component (label, obj) {
      ctx.vueApp.components[label] = obj
    }
  },
  payload: {},
  provide (label, fn) {
    ctx['$' + label] = fn
  },
  $config: {}
}

export let pluginDef

// lib/plugin.js will call this...
export function defineNuxtPlugin (cb) {
  pluginDef = cb
}

// This returns a clean copy of the ctx
export function pluginCtx () {
  return { ...ctx }
}

export function useState (key, init) {
  const nuxtApp = pluginCtx()
  if (!nuxtApp.payload.useState) {
    nuxtApp.payload.useState = {}
  }
  if (!isReactive(nuxtApp.payload.useState)) {
    nuxtApp.payload.useState = reactive(nuxtApp.payload.useState)
  }

  const state = toRef(nuxtApp.payload.useState, key)
  if (state.value === undefined && init) {
    state.value = init()
  }
  return state
}
