import '../assets/scss/globals.scss' // Import styles used by nuxt-stories
export default {
  render () {
    // render nothing here...all rendering is really done in layouts/stories
    // This almost-empty component is still needed by the vue-router when we navigate
    // to /stories.
    // The nuxt-stories module specifies to use 'stories' layout in the meta when call Nuxt's extendPages.
  }
}
