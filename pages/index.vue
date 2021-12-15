<template>
  <div class="container">
    <div class="w-50">
      <NuxtStoriesLogo width="200" />
      <h1 class="title" v-text="'nuxt-stories'" />
      <h2 class="subtitle" v-text="'Painless (and now insanely fast) storybooking for Nuxt'" />
      <div class="border text-start">
        <label class="fw-bold" v-text="'Example Input:'" />
        <div><code v-text=" '<Hello />'"/></div>
        <label class="fw-bold" v-text="'Example Output: (after closing the tag)'" />
        <Hello />
      </div>
      <div class="pt-4">
        <button 
          class="link-btn" 
          v-for="link in links" 
          :key="link.href" 
          v-text="link.text"
          @click="followLink(link)" 
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    const { storiesAnchor, lang } = this.$config.nuxtStories
    return {
      links: [{
        text: 'Demo',
        href: `/${storiesAnchor}/${lang}/`
      }, {
        text: 'Github',
        href: 'https://github.com/richardeschloss/nuxt-stories',
        target: '_blank'
      }]
    }  
  },
  methods: {
    followLink(link) {
      if (link.target === '_blank') {
        window.open(link.href, link.target)
      } else {
        this.$router.push(link.href)
      }
    }
  }
}
</script>

<style scoped>
@import "bootstrap/dist/css/bootstrap.min.css";
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
  font-size: 50px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 30px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
  text-align: center;
}

.link-btn {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.link-btn:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
