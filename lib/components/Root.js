import '../assets/scss/globals.scss'

export default {
  render (h) {
    return h('div', {
      staticClass: 'nuxt-stories'
    }, [
      h('NuxtStoriesHeader')
    ])
  }
}