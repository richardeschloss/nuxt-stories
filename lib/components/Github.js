import { h } from 'vue'
export default {
  props: {
    github: {
      type: String,
      default: ''
    }
  },
  render () {
    return h('a', {
      class: 'nav-link',
      href: `https://github.com/${this.github}`,
      target: '_blank'
    })
  },
  async mounted () {
    const svg = await fetch('/nuxtStories/svg/GithubLogo.svg')
      .then(res => res.text())

    this.$el.innerHTML = svg
  }
}
