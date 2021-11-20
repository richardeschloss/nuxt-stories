<template>
  <div class="container">
    <div>
      <NuxtStoriesLogo width="400" />
      <h1 class="title">
        nuxt-stories
      </h1>
      <h2 class="subtitle">
        Painless (and now insanely fast) storybooking for Nuxt
      </h2>
      <client-only>
        <label><code>&lt;Hello/&gt;</code>: (visible in both the app and in stories)</label>
        <Hello />
      </client-only>
      <div class="links">
        <button
          class="button--grey"
          @click="toStories()"
        >
          Nuxt Stories: See it in action!
        </button>
        <a
          href="https://github.com/richardeschloss/nuxt-stories"
          target="_blank"
          class="button--grey"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    toStories () {
      const { options } = this.$nuxtStories
      const { storiesAnchor } = options
      this.$router.push(`${storiesAnchor}`)
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
