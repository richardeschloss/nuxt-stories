import { getData, storeData } from '../utils/storage.js'

export default {
  props: {
    testFile: {
      type: String,
      default: ''
    },
    testCmd: {
      type: String,
      default: 'ava'
    }
  },
  data () {
    return {
      coverage: false,
      runStatus: '',
      results: {},
      testInfo: {}
    }
  },
  render (h) {
    const children = [
      h('button', {
        staticClass: 'btn btn-primary',
        on: {
          click: async () => {
            this.runStatus = ' (running)'
            this.testInfo = {
              file: this.testFile,
              testCmd: this.testCmd,
              coverage: this.coverage
            }
            await this.runTest()
            storeData('localStorage', {
              item: 'testResults',
              path: this.testFile,
              data: this.results
            })
            this.runStatus = ''
          }
        }
      }, 'Run Tests' + this.runStatus),
      h('input', {
        staticClass: 'ms-2',
        attrs: {
          type: 'checkbox',
          value: this.coverage
        },
        on: {
          click: (evt) => {
            this.coverage = evt.target.value
          }
        }
      }),
      ' For Coverage'
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
      name: 'nuxtStories',
      persist: 'storiesSocket',
      channel: '/',
      namespaceCfg: {
        emitters: ['runTest + testInfo --> results']
      }
    })
    this.results = getData('localStorage', {
      item: 'testResults',
      path: this.testFile
    }) || {}
  }
}
