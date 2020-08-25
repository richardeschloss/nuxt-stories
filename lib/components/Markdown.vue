<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <div v-markdown="compiled" style="display:none;">
      <slot />
    </div>
    <div class="compiled" v-html="compiled" />
  </div>
</template>

<script>
import { directives } from '../plugin.register'

export default {
  directives,
  data () {
    return {
      compiled: ''
    }
  }
}
</script>
