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
  // TBD: imported vars here?
  return {
    data () {
      return { ...frontMatter, imported: {} }
    },
    fetch () {
      if (!cfg.fetch) { return }
      const ctx = this
      // const url = '../_cache/example1.js'
      // import(url) //'../_cache/example1.js')
      // // import('http://localhost:3001/Example1.js')
      // .then(console.log)
      // const { resolve: pResolve } = require('path')
      // console.log('import from', pResolve('../../utils'))
      // fetch('http://localhost:3000/Example1.js')
      // .then(res => res.text())
      // .then(console.log)

      // var u = require('/utils')
      // console.log('u', u)
      // import('../../utils')
      // .then(console.log)
      if (frontMatter.components) {
        /* Import components */
        // this.importComponents(frontMatter.components)
        // send msg to server to nodeFetch
        // save to components/imported
        // lookup with Vue.component(name)  
        // console.log('components', Vue.options.components)  
        // const comps = ['example4', 'string'] //['example1', 'example2', 'example3', 'coffeescript']
        // comps.forEach((c) => {
        //   this.importIt(c)
        // })
        // this.importIt('Example1')
        // this.importIt('Example2')
     
        this.$nuxtSocket({
          persist: 'storiesSocket',
          channel: ''
        }).emit('fetchComponents', { 
          components: frontMatter.components,
          origin: window.location.origin 
        })
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
    mounted() {
      const ctx = this
      window.$nsImported = function() {
        ctx.imported = window.$nsImports
      }
      this.imported = window.$nsImported2
      // console.log('all comp (mounted)', Vue.options.components)
    },
    methods: {
      importComponents(imports) { // kinda works
        fetch('/Importer.js')
        .then(res => res.text())
        .then((text) => {
          const elm = document.getElementById('importedComponents') || document.createElement('script')
          if (elm.id === '') {
            elm.id = "importedComponents"
            elm.type = 'module'
            elm.text = text + '\n'
            + `$nsImport(${JSON.stringify(imports)})\n`
            + 'window.$nsImport = $nsImport'
            document.getElementsByTagName('head')[0].appendChild(elm)            
          } else {
            window.$nsImport(imports)
          }
        })
      },
      importIt(name) { // TBD: import components... this.C (or this.imported.C) = Vue.component(C)? 
        const { extendOptions } = Vue.component(name)
        const { _Ctor, ...imported } = extendOptions
        this.$set(this.imported, name, imported)
      }
    },
    render,
    staticRenderFns
  }
}
