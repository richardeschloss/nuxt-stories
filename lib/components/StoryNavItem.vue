<template>
  <div>
    <div v-if="story.rename">
      <b-form-input
        v-model="newName"
        class="new-name"
        @keyup.enter="$store.dispatch('$nuxtStories/RENAME', {
          story,
          newName
        })"
      />
      <b-input-group-append>
        <b-button
          class="rename"
          variant="primary"
          @click="$store.dispatch('$nuxtStories/RENAME', {
            story,
            newName
          })"
        >
          <b-icon icon="check" />
        </b-button>
        <b-button
          class="cancel"
          variant="outline-info"
          @click="$store.commit('$nuxtStories/SET_STORY_DATA', {
            idxs: story.idxs,
            data: { rename: false }
          })"
        >
          <b-icon icon="x" />
        </b-button>
      </b-input-group-append>
    </div>
    <div v-else-if="story.remove">
      <b-input-group-append>
        <b-button class="remove" variant="primary" @click="$store.dispatch('$nuxtStories/REMOVE', story)">
          <b-icon icon="check" /> Confirm Remove
        </b-button>
        <b-button
          class="cancel"
          variant="outline-info"
          @click="$store.commit('$nuxtStories/SET_STORY_DATA', {
            idxs: story.idxs,
            data: { remove: false }
          })"
        >
          <b-icon icon="x" />
        </b-button>
      </b-input-group-append>
    </div>
    <div v-else class="text-view">
      <span class="story-name">{{ story.name }}</span>
      <b-dropdown
        v-if="crud"
        v-show="story.hovered"
        id="dropdown-left"
        text="..."
        variant="outline-info"
        size="sm"
        right
      >
        <b-dropdown-item
          v-if="level < depth - 1"
          class="add"
          href="#"
          @click="$store.dispatch('$nuxtStories/ADD', story)"
        >
          <b-icon icon="file-earmark-plus" /> Add Story
        </b-dropdown-item>
        <b-dropdown-item
          class="pre-rename"
          href="#"
          @click="$store.commit('$nuxtStories/SET_STORY_DATA', {
            idxs: story.idxs,
            data: { rename: true }
          })"
        >
          <b-icon icon="pencil" /> Rename
        </b-dropdown-item>
        <b-dropdown-item
          class="pre-remove"
          href="#"
          @click="$store.commit('$nuxtStories/SET_STORY_DATA', {
            idxs: story.idxs,
            data: { remove: true }
          })"
        >
          <b-icon icon="trash" /> Remove
        </b-dropdown-item>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    story: {
      type: Object,
      default: () => ({})
    },
    level: {
      type: Number,
      default: () => 0
    },
    depth: {
      type: Number,
      default: () => 2
    },
    crud: {
      type: Boolean,
      default () {
        return false
      }
    }
  },
  data () {
    return {
      newName: ''
    }
  },
  mounted () {
    this.newName = this.story.name
  }
}
</script>

<style>

</style>
