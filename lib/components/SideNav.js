import Debug from 'debug'

const debug = Debug('nuxt-stories')

let _Collapse

const storyChild = {
  props: ['child'],
  data() {
    return {
      editMode: false
    }
  },
  render(h) {
    const { child } = this
    const on = {}
    let childElms
    if (this.editMode) {
      childElms = [
        h('input', { 
          staticClass: 'form-control',
          attrs: {
            value: child.name
          },
          on: {
            blur:() => {
              this.editMode = false
            }
          }
        })
      ]
    } else {
      on.click = () => {
        // if (this.editMode) return
        this.$router.push(child.href)
      }
      childElms = [
        h('a', {
          staticClass: 'd-inline-flex align-items-center rounded',
        }, [ 
          child.name
        ]),
        h('button', { 
          staticClass: 'btn btn-primary bi-pencil float-right',
          on: {
            click: () => {
              this.editMode = true
            }
          }
        }, '')
      ]
    }
    return h('li', {
      style: {
        'cursor': 'pointer'
      },
      on  
    }, childElms)
  }  
}

const storyChildren = {
  props: ['collapse', 'story'],
  render(h) {
    const { story } = this
    return h('div', {
      staticClass: 'collapse'
    }, [
      h('ul', {
        staticClass: 'list-unstyled fw-normal pb-1 small'
      }, 
        story.children.map(child => 
          h(storyChild, { 
            attrs: { child } 
          }
        ))
      )
    ])
  }
}

const storiesTree = {
  render(h) {
    debug('[SideNav] stories', this.stories)
    const storyElms = this.sortedStories
      .map((story) => {
        const children = h(storyChildren, {
          attrs: {
            story
          }
        })
        let collapse
        const currentHref = decodeURIComponent(this.$route.path)
        let showChildren = currentHref.startsWith(story.href)
        this.$nextTick(() => {
          collapse = new _Collapse(children.elm, {
            toggle: false
          })
          if (showChildren) {
            collapse.show()
          } else {
            collapse.hide()
          }
        })
        
        return h('li', {
          staticClass: 'mb-1'
        }, [
          h('button', {
            staticClass: 'btn d-inline-flex align-items-center rounded',
            on: {
              click: () => {
                this.$router.push(story.href)
                collapse.toggle()
              }
            }
          }, story.name),
          children
        ])
      })
      
    return h('ul', {
      staticClass: 'list-unstyled mb-0 py-3 pt-md-1'
    }, [
      ...storyElms,
      h('hr'),
      h('button', {
        staticClass: 'btn d-inline-flex align-items-center rounded',
        on: {
          click: () => {
            this.$router.push('/')
          }
        }
      }, 'App')
    ])  
  },
  computed: {
    stories() {
      return this.$store.state && this.$store.state.$nuxtStories
        ? this.$store.state.$nuxtStories.stories
        : []
    },
    sortedStories() {
      const copy = [ ...this.stories ]
      return copy.sort((a, b) => {
        if (a.order > b.order) {
          return 1
        } else if (a.order < b.order) {
          return -1
        }
        return 0
      })
    }
  }
}

export default {
  render(h) {
    return h('aside', {
      staticClass: 'bd-sidebar'
    }, [
      h('nav', {
        staticClass: 'collapse bd-links',
        attrs: {
          id: 'bd-docs-nav'
        }
      }, [ h(storiesTree) ])
    ])
  },
  async mounted() {
    const { Collapse } = await import('bootstrap/dist/js/bootstrap.esm.js')
    _Collapse = Collapse
  }
}