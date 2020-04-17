<!-- eslint-disable prettier/prettier -->
<template>
  <div>
    <p>
      The navbar will always be at the top, until the user toggles full-screen
      mode.
    </p>

    <navbar :showNav="controls.showNav" :storiesHome="controls.storiesHome" @toggleNav="toggleNav" />

    <h3>Props </h3>
    <b-table :items="propsTbl" striped hover>
      <template v-slot:cell(control)="data">
        <input v-if="data.item.control === 'Boolean'" v-model="controls[data.item.name]" type="checkbox" />
        <b-form-input v-else-if="data.item.control === 'String'" v-model="controls[data.item.name]" />
      </template>
    </b-table>

    <h3>Events </h3>
    <b-table :items="evtsTbl" striped hover />

    <h3>Links </h3>
    <b-table :items="linksTbl" striped hover />
  </div>
</template>

<script>
import Navbar from '@/components/Navbar'
export default {
  components: {
    Navbar
  },
  data() {
    const evtsTbl = []
    const { evts, links } = Navbar.data()
    Object.entries(evts).forEach(([evt, description]) => {
      evtsTbl.push({
        name: evt,
        description,
        count: 0
      })
    })
    const linksTbl = []
    Object.entries(links).forEach(([link, obj]) => {
      linksTbl.push({
        name: link,
        text: obj.text,
        to: obj.to
      })
    })
    const propsTbl = []
    const controls = {}
    Object.entries(Navbar.props).forEach(([prop, obj]) => {
      controls[prop] = obj.default()
      propsTbl.push({
        name: prop,
        description: obj.description,
        control: obj.type.name
      })
    })
    return {
      propsTbl,
      evtsTbl,
      linksTbl,
      controls
    }
  },
  methods: {
    toggleNav() {
      const entry = this.evtsTbl.find(({ name }) => name === 'toggleNav')
      entry.count++
      this.controls.showNav = !this.controls.showNav
    }
  }
}
</script>
