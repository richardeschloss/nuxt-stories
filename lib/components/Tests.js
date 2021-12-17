import TestUtils from '../utils/test.e2e.js'

export default {
  props: {
    testFile: {
      type: String,
      required: true,
      default: ''
    },
    componentName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      testResults: []
    }
  },
  render(h) {
    const hdrs = ['Name', 'Context', 'Err', 'Resp'].map((hdr) => h('th', hdr))
    const rows = this.testResults.map(({name, ctx, errMsg, resp}) => {
      return h('tr', [
        h('td', name),
        h('td', [
          h('json', {
            attrs: {
              data: ctx,
              deep: 0
            }
          })
        ]),
        h('td', errMsg ? errMsg : ''), // err.message not coming through ?
        h('td', resp),
      ])
    })
    return h('table', {
      staticClass: 'table table-striped'
    }, [
      h('thead', hdrs),
      h('tbody', rows)
    ])
  },
  watch: {
    testFile(n) {
      if (n && n !== '') {
        this.runTests(n)
      }
    }
  },
  async mounted() {
    if (this.componentName !== '') {
      const T = TestUtils()
      if (!T.loaded(this.testFile)) {
        await T.load(this.testFile, this.componentName)
      }
      this.testResults = await T.run()
    } else {
      this.socket = this.$nuxtSocket({
        persist: 'storiesSocket',
        channel: '',
        namespaceCfg: {
          emitters: ['runTests --> testResults']
        }
      })
      if (this.testFile) {
        this.runTests(this.testFile)
      }
    }
  }
}