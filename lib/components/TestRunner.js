import { h } from 'vue'
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
  render () {
    const children = [
      h('button', {
        class: 'btn btn-primary',
        onClick: async () => {
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
      }, 'Run Tests' + this.runStatus),
      h('input', {
        class: 'ms-2',
        type: 'checkbox',
        value: this.coverage,
        onClick: (evt) => {
          this.coverage = evt.target.value
        }
      }),
      ' For Coverage'
    ]
    if (this.results.stats) {
      const { stats, asserts } = this.results
      const statsTbl = h('table', {
        class: 'table'
      }, [
        h('thead', [
          h('tr', [
            h('th', { colspan: 2 }, 'STATS')
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
        class: 'table table-striped'
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
