let _Collapse
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
      }, [
        h('ul', {
          staticClass: 'list-unstyled mb-0 py-3 pt-md-1'
        }, this.storyElms(h))
      ])
    ])
  },
  computed: {
    stories() {
      return this.$store.state && this.$store.state.$nuxtStories
        ? this.$store.state.$nuxtStories.stories
        : []
    }
  },
  async mounted() {
    // console.log('[mounted] stories', this.stories)
    const { Collapse } = await import('bootstrap/dist/js/bootstrap.esm.js')
    _Collapse = Collapse
  },
  methods: {
    childElms(h, children) {
      return children.map((child) => {
        return h('li', {
          style: {
            'cursor': 'pointer'
          },
          on: {
            click: (evt) => {
              // evt.preventDefault()
              // history.pushState({}, null, child.href)
              
              this.$router.push(child.href)
              // return false
            }
          }  
        }, [
          h('a', {
            staticClass: 'd-inline-flex align-items-center rounded',
            // class: 'active', // TBD: matches href...
            // attrs: {
            //   href: "", // child.href
            // },
            // on: {
            //   click: (evt) => {
            //     evt.preventDefault()
            //     // history.pushState({}, null, child.href)
                
            //     this.$router.push(child.href)
            //     // return false
            //   }
            // }
          }, [ child.name ])
        ])
      })
      // TBD: go deeper? or limit depth?
    },
    storyElms(h) { // TBD... sort by story order
      return this.stories.map((story) => {
        const children = h('div', {
          staticClass: 'collapse'
        }, [
          h('ul', {
            staticClass: 'list-unstyled fw-normal pb-1 small'
          }, this.childElms(h, story.children))
        ])
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
            // attrs: {
            //   'aria-expanded': showChildren // rotates the chevron icon. I can fit more words without it.
            // },
            on: {
              click: () => {
                showChildren = !showChildren
                this.$router.push(story.href)
                collapse.toggle()
              }
            }
          }, story.name),
          children
        ])
      })  
    }
  }
}