export default {
  props: ['testFile'],
  data () {
    return {
      runStatus: '',
      results: {}
    }
  },
  render (h) {
    const children = [
      h('button', {
        staticClass: 'btn btn-primary',
        on: {
          click: async () => {
            this.runStatus = ' (running)'
            await this.runTest()
            this.runStatus = ''
          }
        }
      }, 'Run Tests' + this.runStatus)
    ]
    if (this.results.stats) {
      const { stats, asserts } = this.results
      const statsTbl = h('table', {
        staticClass: 'table'
      }, [
        h('thead', [
          h('tr', [
            h('th', {
              attrs: {
                colspan: 2
              }
            }, 'STATS')
          ])
        ]),
        h('tbody', [
          h('tr', [
            h('th', 'Asserts'),
            h('td', stats.asserts)
          ]),
          h('tr', [
            h('th', 'Passes'),
            h('td', stats.passes)
          ]),
          h('tr', [
            h('th', 'Failures'),
            h('td', stats.failures)
          ])
        ])
      ])
      children.push(statsTbl)

      const assertsRows = asserts.map(({ name, ok }) => {
        return h('tr', [
          h('td', name),
          h('td', ok ? '✔️' : '❌')
        ])
      })
      const assertsTbl = h('table', {
        staticClass: 'table table-striped'
      }, [
        h('thead', [
          h('tr', [
            h('th', 'Test'),
            h('th', 'Status')
          ])
        ]),
        h('tbody', assertsRows)
      ])
      children.push(assertsTbl)
    }
    return h('div', children)
  },
  mounted () {
    this.socket = this.$nuxtSocket({
      persist: 'storiesSocket',
      channel: '/',
      namespaceCfg: {
        emitters: ['runTest + testFile --> results']
      }
    })
  }
}
