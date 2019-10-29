export const state = () => ({
  stories: {}
})

export const mutations = {
  ADD_STORY(state, story) {
    state.stories.push(story)
  }
}
