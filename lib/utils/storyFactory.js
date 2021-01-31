import { mapState } from 'vuex'
import FetchSvc from './fetch'
import Vue from 'vue'

const storageToObj = storage => storage
  ? Object.entries({ ...storage })
    .reduce((obj, [key, val]) => {
      try {
        obj[key] = JSON.parse(val)
      } catch (err) {
        obj[key] = val
      }
      return obj
    }, {})
  : {}

export default function ({ cfg = {}, frontMatter = {}, render, staticRenderFns }) {
  return {
    data () {
      return { ...frontMatter, imported: {} }
    },
    fetch () {
      if (!cfg.fetch) { return }
      const ctx = this
      // import('../components/example1.js')
      // import('http://localhost:3001/Example1.js')
      // .then(console.log)
      if (process.client && frontMatter.components) {
        /* Import components */
        this.importComponents()
        // send msg to server to nodeFetch
        // save to components/imported
        // lookup with Vue.component(name)    
        // this.importIt('Example1')
        // this.importIt('Example2')
     
        // this.$nuxtSocket({
        //   persist: 'storiesSocket',
        //   channel: ''
        // }).emit('fetchComponents', { components: frontMatter.components })
        // // this.$store.dispatch('$nuxtStories/FETCH_COMPONENTS', {
        // Object.keys(frontMatter.components).forEach(ctx.importIt)
        // })
      }

      if (frontMatter.fetch) {
        FetchSvc.fetch({
          fetchInfo: frontMatter.fetch,
          fetchOpts: frontMatter.fetchOpts,
          ctx,
          // eslint-disable-next-line no-console
          notify: console.error
        })
      }

      if (frontMatter.nodeFetch) {
        this.$store.dispatch('$nuxtStories/FETCH', {
          fetchInfo: frontMatter.nodeFetch,
          fetchOpts: frontMatter.fetchOpts,
          ctx: { ...frontMatter },
          origin: window.location.origin,
          path: this.$route.path
        })
      }
    },
    computed: {
      localStorage () {
        return storageToObj(global.localStorage)
      },
      sessionStorage () {
        return storageToObj(global.sessionStorage)
      },
      ...mapState({
        fetched (state) {
          return state &&
            state.$nuxtStories &&
            state.$nuxtStories.fetched &&
            state.$nuxtStories.fetched[this.$route.path]
            ? state.$nuxtStories.fetched[this.$route.path]
            : {}
        }
      })
    },
    methods: {
      importComponents(components) {
        const imports = {
          C: 'https://coffeescript.org/browser-compiler-modern/coffeescript.js',
          E: '/Example1.js'
        }
        const ctx = this
        window.imported = function(imports) {
          ctx.imported = imports
          console.log('imported', imports)
        }
        const objStr = Object.keys(imports).join(', ')
        const s = Object.entries(imports)
          .map(([key, url]) => `import ${key} from '${url}'`)
          .join('\n')
          + `\nwindow.imported({ ${objStr} })\n`
    
        const elm = document.createElement('script')
        elm.id = "importedComponents"
        elm.type = 'module'
        elm.text = s
        document.getElementsByTagName('head')[0].appendChild(elm)
        
      },
      // async imp(url) {
      //   console.log('url', url)
      //   const imported = await import(url)
      //   this.$set(this, 'imported', imported)
      // },
      importIt(name) {
        const { extendOptions } = Vue.component(name)
        const { _Ctor, ...rest } = extendOptions
        rest.methods = Object.entries(rest)
          .reduce((arr, [key, val]) => {
            if (typeof val === 'function') {
              arr.push(key)
            }
            return arr
          }, [])
        this.$set(this.imported, name, rest)
        console.log('imported?', this.imported)
      }
    },
    render,
    staticRenderFns
  }
}
