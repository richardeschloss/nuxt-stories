<template>
  <nav aria-label="Breadcrumbs">
    <b-breadcrumb
      class="d-inline-flex my-0 px-2 py-1 bg-transparent"
      :items="items"
    />
  </nav>
</template>

<script>
export default {
  computed: {
    items () {
      const items = [
        { text: 'App', to: '/' },
        { text: 'Stories', to: '' }
      ]
      let crumbPath

      if (this.$nuxtStories) {
        crumbPath = `/${this.$nuxtStories.options.storiesAnchor}`
        items[1].to = crumbPath
      }

      const crumbs = decodeURIComponent(this.$route.path).split('/').slice(2)

      crumbs.forEach((crumb, idx) => {
        crumbPath += `/${crumb}`
        if (idx === 0) { return }
        items.push({
          text: crumb,
          to: crumbPath
        })
      })
      return items
    }
  }
}
</script>
