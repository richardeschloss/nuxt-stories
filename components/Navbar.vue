<template>
  <div>
    <button
      id="stories-nav-toggle"
      @click="$emit('toggleNav')"
      v-html="navToggleLabel"
      class="btn btn-outline-primary btn-sm"
    />
    <transition name="fade-stories-nav">
      <nav
        v-show="showNav"
        class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0"
      >
        <nuxt-link
          :to="storiesHome"
          v-html="links.storiesHome.text"
          class="navbar-brand col-sm-3 col-md-2 mr-0 stories-home"
        />
        <ul class="navbar-nav px-3">
          <li class="nav-item text-nowrap">
            <nuxt-link
              :to="links.app.to"
              v-html="links.app.text"
              class="nav-link"
            />
          </li>
        </ul>
      </nav>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    showNav: {
      type: Boolean,
      description: 'show/hide the top black navbar',
      default: () => true
    },
    storiesHome: {
      type: String,
      description: 'link to the stories home',
      default: () => '/.stories'
    }
  },
  data() {
    return {
      evts: {
        toggleNav: 'Event emitted by clicking the "stories-nav-toggle" button'
      },
      links: {
        app: { to: '/', text: 'Back to App' },
        storiesHome: { to: '[storiesHome]', text: 'Stories' }
      }
    }
  },
  computed: {
    navToggleLabel() {
      return this.showNav ? '\u2196' : '\u2198'
    }
  }
}
</script>

<style scoped>
.stories-home {
  padding-left: 40px;
}

#stories-nav-toggle {
  position: fixed;
  background-color: white;
  color: #007bff;
  z-index: 1022;
  margin-top: 5px;
}
#stories-nav-toggle:hover {
  background-color: #007bff;
  color: white;
}

.fade-stories-nav-enter-active,
.fade-stories-nav-leave-active {
  transition: all 0.25s ease-in-out;
}
.fade-stories-nav-enter,
.fade-stories-nav-leave-to {
  opacity: 0;
}

#stories-nav-toggle {
  transition: all 0.5s ease-in;
}
</style>
