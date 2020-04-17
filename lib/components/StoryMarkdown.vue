<template>
  <!-- eslint-disable vue/require-component-is -->
  <div id="editor">
    <textarea
      @input="compileContents()"
      v-model="storiesData.contents"
      v-show="showEditor"
      :class="editorCss"
    />
    <component :is="storiesData.compiled" v-show="showView" :class="viewerCss" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      storiesData: {}
    }
  },
  computed: {
    editorCss() {
      return this.viewMode === 'edit' ? 'w-100' : ''
    },
    showEditor() {
      return this.viewMode !== 'view'
    },
    showView() {
      return this.viewMode !== 'edit'
    },
    viewerCss() {
      return this.viewMode === 'view' ? 'w-100' : 'overflow-y-scroll'
    },
    viewMode() {
      return this.$store.state && this.$store.state.$nuxtStories
        ? this.$store.state.$nuxtStories.viewMode
        : ''
    }
  },
  mounted() {
    this.$nuxtStories()
  }
}
</script>

<style scoped>
.overflow-y-scroll {
  overflow-y: scroll;
}

#editor {
  margin: 0;
  height: 100%;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #333;
}

textarea,
#editor div {
  display: inline-block;
  width: 49%;
  height: 100vh;
  vertical-align: top;
  box-sizing: border-box;
  padding: 0 20px;
}

textarea {
  border: none;
  border-right: 1px solid #ccc;
  resize: vertical;
  outline: none;
  background-color: #f6f6f6;
  font-size: 14px;
  font-family: 'Monaco', courier, monospace;
  padding: 20px;
}

code {
  color: #f66;
}
</style>
