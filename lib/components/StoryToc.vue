<template>
  <b-col
    class="bd-toc d-none d-xl-block"
    tag="nav"
    xl="2"
    aria-label="Secondary navigation"
    aria-hidden="true"
  >
    <b-nav
      v-b-scrollspy="{ offset }"
      class="section-nav"
      vertical
    >
      <li
        v-for="hdr in toc"
        :key="hdr.href"
        class="toc-entry"
        :class="hdrClass(hdr)"
      >
        <b-link
          :href="hdr.href"
          class="nav-link"
          @click="scrollIntoView($event, hdr.href)"
        >
          <span>{{ hdr.text }}</span>
        </b-link>
      </li>
    </b-nav>
  </b-col>
</template>

<script>
export default {
  data () {
    return {
      offset: 0
    }
  },
  computed: {
    toc () {
      return this.$store && this.$store.state.$nuxtStories
        ? this.$store.state.$nuxtStories.toc
        : []
    },
    hdrClass () {
      return hdr => `toc-h${hdr.depth}`
    }
  },
  mounted () {
    const $header = document.body.querySelector('header.navbar')
    /* istanbul ignore next */
    if ($header) {
      this.offset = $header.offsetHeight + 10
    }
    this.contentElm = document.getElementById('story-content')
  },
  methods: {
    /* istanbul ignore next */
    scrollIntoView (evt, href) {
      evt.preventDefault()
      evt.stopPropagation()
      const headerElm = document.getElementById(href.replace('#', ''))
      const { contentElm } = this
      const { y: y1 } = headerElm.getBoundingClientRect()
      const { y: y2 } = contentElm.getBoundingClientRect()

      contentElm.animate([
        { transform: `translateY(${y2}px)` },
        { transform: `translateY(${y2 - y1}px)` }
      ], {
        easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
        duration: 100
      }).onfinish = () => {
        document.scrollingElement.scrollTop = y1 - y2
      }
    }
  }
}
</script>

<style scoped>
li.toc-h1 {
  font-weight: bold;
  margin-bottom: 0.5rem !important;
}
li.toc-h2 {
  padding-left: 20px;
  margin-bottom: 0.25rem !important;
}
li.toc-h3 {
  padding-left: 40px;
}
</style>
