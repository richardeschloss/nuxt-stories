<template>
  <b-navbar toggleable="lg" tag="header" type="dark" variant="dark"
    class="bd-navbar shadow">
    <b-navbar-brand
        :to="$nuxtStories ? `/${$nuxtStories.options.storiesAnchor}` : ''"
        exact
        active-class="active"
        aria-label="BootstrapVue"
      >
      <stories-logo /> Nuxt Stories
    </b-navbar-brand>
    
    <b-navbar-nav class="ml-auto mr-2">
      
    <b-button-group>
      <b-button
        v-for="mode in modes"
        :key="mode.name"
        :class="modeActive(mode.name) ? 'active' : ''"
        @click="setViewMode(mode.name)">
        <b-icon :icon="mode.icon" />
      </b-button>
    </b-button-group>
      
    </b-navbar-nav>
    <b-form-input class="mr-sm-2 form-control-dark w-75" placeholder="Search"></b-form-input>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto">
        <b-nav-item-dropdown text="Lang" right>
          <b-dropdown-item href="#">EN</b-dropdown-item>
          <b-dropdown-item href="#">ES</b-dropdown-item>
          <b-dropdown-item href="#">RU</b-dropdown-item>
          <b-dropdown-item href="#">FA</b-dropdown-item>
        </b-nav-item-dropdown>

        <b-nav-item-dropdown right>
          <!-- Using 'button-content' slot -->
          <template v-slot:button-content>
            <em>User</em>
          </template>
          <b-dropdown-item href="#">Profile</b-dropdown-item>
          <b-dropdown-item href="#">Sign Out</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item
          :href="githubURL"
          target="_blank"
          :link-attrs="{ 'aria-label': 'GitHub' }"
        >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          height="25"
          class="navbar-nav-svg"
          focusable="false"
          role="img"
        >
          <title>GitHub</title>
          <g fill="currentColor">
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M16,0.4c-8.8,0-16,7.2-16,16c0,7.1,4.6,13.1,10.9,15.2 c0.8,0.1,1.1-0.3,1.1-0.8c0-0.4,0-1.4,0-2.7c-4.5,1-5.4-2.1-5.4-2.1c-0.7-1.8-1.8-2.3-1.8-2.3c-1.5-1,0.1-1,0.1-1 c1.6,0.1,2.5,1.6,2.5,1.6c1.4,2.4,3.7,1.7,4.7,1.3c0.1-1,0.6-1.7,1-2.1c-3.6-0.4-7.3-1.8-7.3-7.9c0-1.7,0.6-3.2,1.6-4.3 c-0.2-0.4-0.7-2,0.2-4.2c0,0,1.3-0.4,4.4,1.6c1.3-0.4,2.6-0.5,4-0.5c1.4,0,2.7,0.2,4,0.5C23.1,6.6,24.4,7,24.4,7 c0.9,2.2,0.3,3.8,0.2,4.2c1,1.1,1.6,2.5,1.6,4.3c0,6.1-3.7,7.5-7.3,7.9c0.6,0.5,1.1,1.5,1.1,3c0,2.1,0,3.9,0,4.4 c0,0.4,0.3,0.9,1.1,0.8C27.4,29.5,32,23.5,32,16.4C32,7.6,24.8,0.4,16,0.4z"
            />
          </g>
        </svg>
      </b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>

<script>
export default {
  data() {
    return { 
      githubURL: 'https://github.com/richardeschloss/nuxt-stories',
      modes: [
        { name: 'edit', icon: 'pencil' },
        { name: 'split', icon: 'layout-split' },
        { name: 'view', icon: 'eye-fill' }
      ]
    }
  },
  computed: {
    modeActive() {
      return (mode) => this.$store.state && this.$store.state.$nuxtStories
        ? mode === this.$store.state.$nuxtStories.viewMode
        : false
    }
  },
  methods: {
    setViewMode(mode) {
      this.$store.commit('$nuxtStories/SET_VIEW_MODE', mode)
    }
  }  
}
</script>

<style scoped>

.form-control-dark {
  color: #fff;
  background-color: rgba(255, 255, 255, .1);
  border-color: rgba(255, 255, 255, .1);
}

.form-control-dark:focus {
  color: #495057;
  border-color: transparent;
  background-color: rgba(255, 255, 255, 1);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, .25);
}
</style>