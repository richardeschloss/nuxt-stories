import '../assets/scss/globals.scss'
export default {
  // Prefer a layout to keep certain things like header and sidebar fixed
  // when routes change to different stories. Otherwise, we get this annoying flickering
  // with the header and sidebar re-rendering again and scrollbars resetting.
  layout: 'stories', // TBD: if using this layout, remember to copy over on postinstall
  render () {
  }
}
