<template>
  <div>
    <div style="display:none;" v-markdown="compiled">
      <slot></slot> 
    </div>
    <div v-html="compiled">
    </div>
  </div>
</template>

<script>
import { directives } from '../plugin.register'

export default {
  directives,
  data() {
    return {
      compiled: ''
    }
  }
}
</script>
