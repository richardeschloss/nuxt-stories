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
    name: 'StoryFactory',
    data () {
      return { ...frontMatter, imported: {}, esmsFetched: false, scriptsFetched: false }
    },
    fetch () {
      if (!cfg.fetch) { return }
      const ctx = this
      if (frontMatter.esm) {
        this.esmsFetched = false
        this.$store.dispatch('$nuxtStories/FETCH_ESM', {
          esm: frontMatter.esm,
          origin: window.location.origin,
          path: this.$route.path
        }).then(() => {
          this.esmsFetched = true
        })
      }

      if (frontMatter.scripts) {
        this.scriptsFetched = false
        this.$store.dispatch('$nuxtStories/FETCH_SCRIPTS', {
          scripts: frontMatter.scripts,
          origin: window.location.origin,
          path: this.$route.path
        }).then(() => {
          this.scriptsFetched = true
        })
      }

      if (frontMatter.components) {
        this.$store.dispatch('$nuxtStories/FETCH_COMPONENTS', {
          components: frontMatter.components,
          origin: window.location.origin,
          path: this.$route.path
        }).then(() => {
          this.imported = this.$store.state.$nuxtStories.components // [this.$route.path]
        })
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
      // const ctx = this
      // window.$nsImported = function() {
      //   ctx.imported = window.$nsImports
      // }
      // this.imported = window.$nsImported2
    },
    methods: {
      importComponentsFE(imports) { // kinda works
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
      }
    },
    render,
    staticRenderFns
  }
}
