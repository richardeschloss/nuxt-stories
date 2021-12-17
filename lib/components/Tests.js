export default {
  props: {
    testFile: {
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
              data: ctx
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
  mounted() {
    this.socket = this.$nuxtSocket({
      persist: 'storiesSocket',
      channel: '',
      namespaceCfg: {
        emitters: ['runTests --> testResults']
      }
    })
    if (this.testFile) {
      console.log('testFile', this.testFile)
      this.runTests(this.testFile)
    }
  }
}