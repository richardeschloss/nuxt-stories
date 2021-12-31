<template>
  <div class="app-container w-50 nuxt-stories-demo">
    <div>
      <Logo width="100" class="py-2" />
      <Readme />
      <div class="pt-4 links">
        <button
          v-for="link in links"
          :key="link.href"
          class="link-btn"
          @click="followLink(link)"
          v-text="link.text"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Logo from '@/lib/components/Logo.js'
import Readme from '@/lib/components/Readme.js'
export default {
  components: {
    Logo,
    Readme
  },
  data () {
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
    followLink (link) {
      if (link.target === '_blank') {
        window.open(link.href, link.target)
      } else {
        this.$router.push(link.href)
      }
    }
  }
}
</script>

<style>
.app-container {
  margin: 0 auto;
  min-height: 100vh;
  /* display: flex; */
  justify-content: center;
  align-items: center;
  /* text-align: center; */
}

#nuxt-stories {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 50px;
  color: #35495e;
  letter-spacing: 1px;
}

#nuxt-stories + blockquote {
  font-weight: 300;
  font-size: 30px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

#video-overview + iframe {
  width: 100%;
}

#features + ul {
  text-align: left;
  list-style: none;
}
</style>

<style scoped>
.links {
  position: fixed;
  top: 0;
  right: 0;
  padding-right: 15px;
  /* padding-top: 15px;
  text-align: center; */
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
