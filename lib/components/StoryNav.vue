<template>
  <b-col
    cols="12"
    md="3"
    xl="2"
    class="bd-sidebar border-bottom-0"
  >
    <nav id="bd-docs-nav" class="bd-links d-none d-md-block" aria-label="Main navigation">
      <b-link
        v-for="group in sorted(stories)"
        :key="group.name"
        :to="group.to"
        :disabled="group.disabled"
        router-tag="div"
        class="bd-toc-item"
        active-class="active"
      >
        <b-link
          v-story-hover="group"
          :to="group.to"
          :disabled="group.disabled"
          class="bd-toc-link l0-link"
          active-class=""
          no-prefetch
        >
          <story-nav-item :story="group" :crud="showCRUD" :level="0" />
        </b-link>
        <b-nav class="bd-sidenav">
          <b-link
            v-for="child in sorted(group.children || [])"
            :key="child.name"
            :to="child.to"
            :disabled="child.disabled"
            router-tag="li"
            class="nav-item"
            active-class="active bd-sidenav-active"
          >
            <b-link
              v-story-hover="child"
              :to="child.to"
              class="nav-link l1-link"
              active-class=""
            >
              <story-nav-item :story="child" :crud="showCRUD" :level="1" />
            </b-link>
          </b-link>
        </b-nav>
      </b-link>
      <div v-show="showCRUD" class="centered">
        <b-button id="addStory" @click="$store.dispatch('$nuxtStories/ADD')">
          <b-icon icon="file-earmark-plus" /> Add Story
        </b-button>
      </div>
      <hr>

      <b-link to="/" exact router-tag="div" active-class="active">
        <b-link to="/" exact class="bd-toc-link" active-class="">
          App
        </b-link>
      </b-link>
    </nav>
  </b-col>
</template>

<script>
import { mapState } from 'vuex'
import { sortStories } from '../utils/sort'

export default {
  directives: {
    storyHover: {
      inserted (el, binding, { context }) {
        const { staticHost } = context.$nuxtStories.options
        const group = binding.value
        if (!staticHost) {
          el.addEventListener('mouseover', () => {
            context.$store.commit(
              '$nuxtStories/SET_STORY_DATA',
              {
                idxs: group.idxs,
                data: { hovered: true }
              }
            )
          })
          el.addEventListener('mouseout', () => {
            context.$store.commit(
              '$nuxtStories/SET_STORY_DATA',
              {
                idxs: group.idxs,
                data: { hovered: false }
              }
            )
          })
        }
      }
    }
  },
  computed: {
    ...mapState({
      stories: (state) => {
        return state && state.$nuxtStories
          ? state.$nuxtStories.stories
          : []
      }
    }),
    sorted () {
      return sortStories
    },
    showCRUD () {
      return !this.$nuxtStories.options.staticHost
    }
  }
}
</script>

<style scoped>
.centered {
  text-align: center;
}
</style>
