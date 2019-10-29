<template>
  <div>
    <nav class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
      <a class="navbar-brand col-sm-3 col-md-2 mr-0" href="#">Stories</a>
      <!-- <input class="form-control form-control-dark w-100" type="text" placeholder="Search" aria-label="Search">
      <ul class="navbar-nav px-3">
        <li class="nav-item text-nowrap">
          <a class="nav-link" href="#">Sign out</a>
        </li>
      </ul> -->
    </nav>
    <div class="container-fluid">
      <div class="row">
        <nav class="col-md-2 d-none d-md-block bg-light sidebar">
          <div class="sidebar-sticky">
            <ul class="nav flex-column">
              <li class="nav-item" v-for="story in stories" :key="story.name">
                <nuxt-link :to="story.path"> {{ story.name }} </nuxt-link>
              </li>
            </ul>
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
  mounted() {
    const storyRoutes = this.$router.options.routes.find(
      ({ name }) => name === '.stories'
    )
    if (storyRoutes) {
      this.stories = storyRoutes.children.map((child) => {
        child.path = `/.stories/${child.path}`
        console.log('path', child.path)
        return child
      })
      console.log('stories', this.stories)
    }
  }
}
</script>

<style>
</style>
