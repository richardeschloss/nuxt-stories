import '../assets/scss/globals.scss'
export const meta = {
  // Prefer a layout to keep certain things like header and sidebar fixed
  // when routes change to different stories. Otherwise, we get this annoying flickering
  // with the header and sidebar re-rendering again and scrollbars resetting.
  layout: 'stories'
}
export default {
  render () {
  }
}
