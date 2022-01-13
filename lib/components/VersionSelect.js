import { h } from 'vue'
import Dropdown from './Dropdown.js'
export default {
  props: {
    versions: {
      type: Array,
      default: []
    }
  },
  render () {
    return h(Dropdown, {
      text: this.versions[0].version || '',
      navItem: true,
      right: true,
      items: this.versions.map(({ version, url }) => {
        return {
          label: version,
          value: url
        }
      }),
      onItemSelected: (item) => {
        if (item.value) {
          window.open(item.value, '_blank')
        }
      }
    })
  }
}
