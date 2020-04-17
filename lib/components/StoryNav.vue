<template>
  <b-col cols="12" md="3" xl="2"
    class="bd-sidebar border-bottom-0"
  >
    <nav id="bd-docs-nav" class="bd-links d-none d-md-block" aria-label="Main navigation">
      <b-link
        v-for="group in sorted(stories)"
        :key="group.name"
        :to="group.path" 
        router-tag="div"
        class="bd-toc-item"
        active-class="active"
      >
        <b-link
          :to="group.path"
          class="bd-toc-link"
          active-class=""
          no-prefetch
        >
          {{ group.name }}
        </b-link>
        <b-nav class="bd-sidenav">
          <b-link
            v-for="child in sorted(group.children || [])"
            :key="child.name"
            :to="child.path"
            router-tag="li"
            class="nav-item"
            active-class="active bd-sidenav-active"
          >
            <b-link
              :to="child.path"
              class="nav-link"
              active-class=""
            >
              {{ child.name }}
            </b-link>
          </b-link>
        </b-nav>
      </b-link>
      <hr>

      <b-link to="/" exact router-tag="div" active-class="active">
        <b-link to="/" exact class="bd-toc-link" active-class="">App</b-link>
      </b-link>

    </nav>
  </b-col>
</template>

<script>
import { mapState } from 'vuex'
function sortItems(items) {
  const copy = [...items]
  return copy.sort(({ frontMatter: a }, { frontMatter: b }) => {
    let aOrder = a ? a.order : 0
    let bOrder = b ? b.order : 0
    if (aOrder > bOrder) {
      return 1
    } else if (aOrder < bOrder) {
      return -1
    }
    return 0
  })
}

export default {
  computed: {
    ...mapState({
      stories: (state) => {
        return state && state.$nuxtStories
          ? state.$nuxtStories.stories
          : []
      }
    }),
    sorted() {
      return sortItems
    },
  }
}
</script>