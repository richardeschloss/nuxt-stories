<!-- eslint-disable -->
<template>
  <div>
    <markdown>
      # Child
    This section describes the UI used for the stories. The UI is organized
    as:

    * [Navbar](/.stories/Components/Navbar)
    * Stories Nav
    * Stories Main

    </markdown>

    The UI will look like this at various device sizes: <br/>
    <b-form-group label="Select Device Size">
      <b-form-radio-group v-model="selectedLayout" :options="layouts" />
    </b-form-group>


    <div class="mt-3">Selected: <strong>{{ selectedLayout }}</strong></div>
    <iframe v-if="selectedLayout !== ''" :class="selectedLayout" src="/.stories"  />

    <markdown>
      # Child 2

      Here is another section...
    </markdown>
  </div>
</template>

<script>
export default {
  data () {
    return {
      selectedLayout: '',
      layouts: [
        {
          text: 'Desktop',
          value: 'w-100 vh-100'
        },
        {
          text: 'Mobile',
          value: 'w-25 vh-100'
        },
        {
          text: 'None',
          value: ''
        }
      ]
    }
  }
}
</script>

<style scoped>
.stories-table {
  width: 50%;
  border: 1px solid;
}

.stories-table > tbody > tr {
  text-align: center;
  border: 1px solid;
}
</style>
