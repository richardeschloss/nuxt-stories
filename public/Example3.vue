<template>
  <div id="example3-root">
    Hi this is example 3. I am just a simple counter:
    <button @click="cnt++">
      Click Me: {{ cnt }}
    </button>
  </div>
</template>

<script>
export default {
  data () {
    return {
      cnt: 0
    }
  }
}
</script>

<style scoped>
#example3-root {
  border: 1px solid;
}

</style>
