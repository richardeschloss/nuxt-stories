<template>
  <div>
    <nav class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
      <a class="navbar-brand col-sm-3 col-md-2 mr-0" href="#">Stories</a>
    </nav>
    <div class="container-fluid">
      <div class="row">
        <nav class="col-md-2 d-none d-md-block bg-light sidebar">
          <div class="sidebar-sticky">  
          <b-card no-body class="mb-1 nav flex-column" v-for="story in stories" :key="story.name">
            <b-card-header header-tag="header" class="p-1" role="tab">
              <b-button block @click="toggleVisibility(story)" variant="info">
                <nuxt-link :to="story.path" style="color:white;">{{ story.name }}</nuxt-link></b-button>
            </b-card-header>
            <b-collapse :id="storyId(story.name)" :visible="story.visible" accordion="my-accordion" role="tabpanel">
              <b-card-body>
                <b-card-text>Child stories would probably show here</b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
          </div>
        </nav>
        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">         
          <nuxt-child></nuxt-child>
        </main>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      stories: []
    }
  },
  computed: {
    storyId() {
      return (name) => `accordion-${name}`
    }
  },
  mounted() {
    const storyRoutes = this.$router.options.routes.find(
      ({ name }) => name === '.stories'
    )
    if (storyRoutes && storyRoutes.children && storyRoutes.children.length) {
      this.stories = storyRoutes.children.map((child) => {
        if (!child.path.startsWith('/.stories/')) {
          child.path = `/.stories/${child.path}`
        }
        child.name = child.name.replace('root-', '')
        child.visible = false
        return child
      })
      console.log('stories', this.stories)
    }
  },
  methods: {
    toggleVisibility(story) {
      this.stories.forEach((s) => {
        if (s.name !== story.name) {
          s.visible = false
        }
      })
      story.visible = !story.visible
    }
  }
}
</script>

<style>
</style>
