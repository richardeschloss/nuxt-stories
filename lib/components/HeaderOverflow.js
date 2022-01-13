import { h } from 'vue'
import Github from './Github.js'
import LangSelect from './LangSelect.js'
import VersionSelect from './VersionSelect.js'

export default {
  render () {
    return h('div', {
    }, [
      h('ul', {
        class: 'navbar-nav' // ml-auto'
      }, [
        h('li', {
          class: 'nav-item mx-md-2'
        }, [
          h(LangSelect, {
            style: {
              width: '10%'
            }
          })
        ]),
        h('li', {
          class: 'nav-item mx-md-2'
        }, [
          h(VersionSelect, {
            versions: [{
              version: '3.x (current)'
            }, {
              version: '2.x',
              url: 'https://deploy-preview-93--nuxt-stories.netlify.app/stories'
            }]
          })
        ]),
        h('li', {
          class: 'nav-item'
        }, [
          h(Github, {
            style: {
              width: '10%'
            },
            github: 'richardeschloss/nuxt-stories'
          })
        ])
      ])
    ])
  }
}
