<template>
  <div>
    <nav class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
      <a class="navbar-brand col-sm-3 col-md-2 mr-0" href="#" @click="storiesHome(story)">Stories</a>
      <ul class="navbar-nav px-3">
        <li class="nav-item text-nowrap">
          <a class="nav-link" href="/">Back to APP</a>
        </li>
      </ul>
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
                <b-card-text>
                  <b-nav vertical class="story-child-nav-item" v-for="child in story.children" :key="child.name">
                    <b-list-group>
                      <b-list-group-item :active="childActive(child)" @click="showChild(child)"> 
                        {{ cleanName(child.name) }}
                      </b-list-group-item>
                      <b-list-group-item>Child 2 (add file to {{story.name}} dir</b-list-group-item>
                      <b-list-group-item>Child 3 (add file to {{story.name}} dir</b-list-group-item>
                    </b-list-group>
                  </b-nav>
                </b-card-text>
              </b-card-body>
            </b-collapse>
          </b-card>
          </div>
        </nav>
        <main role="main" class="col-md-9 ml-sm-auto col-lg-10 pt-3 px-4">
          <h2>Story content goes here! Click items in the left sidebar...</h2>
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
    childActive() {
      return (child) => {
        const { fullPath } = this.$route
        const childFullPath = child.name
          .replace('index-', '/.stories/')
          .replace('-', '/')
        return fullPath === childFullPath
      }
    },
    cleanName() {
      return (name) => (name ? name.split('-').slice(-1)[0] : '')
    },
    storyId() {
      return (name) => `accordion-${name}`
    }
  },
  mounted() {
    const storyRoutes = this.$router.options.routes.find(
      ({ name }) => name === '.stories'
    )
    const currentRoute = this.$route.name
    if (storyRoutes && storyRoutes.children && storyRoutes.children.length) {
      this.stories = storyRoutes.children.map((child) => {
        if (!child.path.startsWith('/.stories/')) {
          child.path = `/.stories/${child.path}`
        }
        child.name = this.cleanName(child.name)
        child.visible = false
        if (child.children && child.children.length) {
          child.children.forEach((c) => {
            c.active = false
            if (currentRoute.includes(c.name)) {
              c.active = true
            }
          })
        }
        return child
      })
    }
  },
  methods: {
    showChild(child) {
      if (this.childActive(child)) return
      const toPath = child.name
        .replace('index-', '/.stories/')
        .replace('-', '/')
      this.$router.push(toPath)
    },
    storiesHome() {
      this.$router.push('/.stories')
    },
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
.story-child-nav-item {
  cursor: pointer;
}
</style>
