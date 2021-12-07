import Debug from 'debug'

const debug = Debug('nuxt-stories')

let _Collapse

const preCrud = {
  props: ['story'],  
  render(h) {
    return h('div', {
      staticClass: 'btn-group float-end'
    }, [
      h('button', { 
        staticClass: 'btn bi-plus', 
        on: {
          click: () => this.addStory()
        }
      }),
      h('button', { 
        staticClass: 'btn bi-pencil', 
        on: {
          click: () => this.preRename()
        }
      }),
      h('button', { 
        staticClass: 'btn bi-trash', 
        on: {
          click: () => this.preRemove()
        }
      })
    ])
  },
  methods: {
    addStory() {
      this.$nuxtSocket({ persist: 'storiesSocket' })
        .emit('addStory', this.story.href)
    },
    preRename() {
      this.$emit('enterEdit')
    },
    preRemove() {
      this.$emit('enterRemove')
    }
  }
}

const nodeRemove = {
  props: ['story'],
  render(h) {
    return h('div', {
      staticClass: ''
    }, [
      h('button', {
        staticClass: 'btn d-inline-flex align-items-center rounded'
      }, this.story.name),
      h('div', {
        staticClass: 'btn-group float-end'
      }, [
        h('button', {
          staticClass: 'btn bi-check2 text-danger',
          on: {
            click: () => this.remove()
          }
        }, ['Delete?']),
        h('button', {
          staticClass: 'btn bi-x',
          on: {
            click: () => this.exit()
          }
        }, ['Cancel'])
      ])
    ])
  },
  methods: {
    exit() {
      this.$emit('exitRemove')
    },
    remove() {
      this.$nuxtSocket({ persist: 'storiesSocket' })
        .emit('removeStory', this.story.href)  
    }  
  }
}

const nodeEdit = {
  props: ['story'],
  data() {
    return {
      newName: ''
    }
  },
  render(h) {
    const { story } = this
    return h('div', [
      h('input', {
        staticClass: 'form-control',
        attrs: {
          value: story.name
        },
        on: {
          input: (evt) => {
            this.newName = evt.target.value  
          },
          keyup: (evt) => {
            if (evt.key === 'Enter') {
              this.rename()
            }
          },
          blur: () => this.exit()
        }
      }),
      h('div', {
        staticClass: 'btn-group'
      }, [
        h('button', {
          staticClass: 'btn bi-check2',
          on: {
            click: () => this.rename()
          }
        }),
        h('button', {
          staticClass: 'btn bi-x',
          on: {
            click: () => this.exit()
          }
        })
      ])
    ])
  },
  methods: {
    exit() {
      this.newName = ''
      this.$emit('exitEdit')
    },
    rename() {
      const oldHref = this.story.href
      const parts = oldHref.split('/')
      const newHref = [...parts.slice(0, parts.length - 1), this.newName].join('/')
      this.$nuxtSocket({ persist: 'storiesSocket' })
        .emit('renameStory', { oldHref, newHref })
      this.exit()
    }
  }
}

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

const storyElm = {
  props: ['story'],
  data() {
    return {
      deleteMode: false,
      editMode: false,
      showCRUD: false,
      newName: ''
    }
  },
  render(h) {
    const { story } = this
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
    
    const storyView = [
      h('button', {
        staticClass: 'btn d-inline-flex align-items-center rounded',
        on: {
          click: () => {
            this.$router.push(story.href)
            collapse.toggle()
          }
        }
      }, [ 
        story.name,
      ]),
      this.showCRUD
        ? h(preCrud, {
          attrs: { story },
          on: {
            enterEdit: () => {
              this.editMode = true
            },
            enterRemove: () => {
              this.deleteMode = true
            }
          }
        })
        : h()
    ]
    let mainNode
    if (this.deleteMode) {
      mainNode = h(nodeRemove, {
        attrs: { story },
        on: {
          exitRemove: () => {
            this.deleteMode =false
          }
        }
      })
    } else if (this.editMode) {
      mainNode = h(nodeEdit, { 
        attrs: { story },
        on: {
          exitEdit: () => {
            this.editMode = false
          }
        }
      })
    } else {
      mainNode = [ ...storyView ]
    }

    return h('li', {
      staticClass: 'mb-1',
      on: {
        mouseover: () => {
          this.showCRUD = true
        },
        mouseleave: (evt) => {
          this.showCRUD = false
        }
      }
    }, [
      mainNode,
      children
    ])
  }
}

const storiesTree = {
  render(h) {
    debug('[SideNav] stories', this.stories)
    const storyElms = this.sortedStories
      .map((story) => 
        h(storyElm, { 
          attrs: { 
            story
          }
        })
      )
      
    return h('ul', {
      staticClass: 'list-unstyled mb-0 py-3 pt-md-1'
    }, [
      ...storyElms,
      h('li', [
        h('button', {
          staticClass: 'btn bi-plus',
          style: {
            color: '#0a53be'
          },
          on: {
            click: () => this.addStory()
          }
        }, 'ADD STORY')
      ]),
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
  },
  methods: {
    addStory() {
      const { 
        storiesAnchor,
        lang
      } = this.$config.nuxtStories
      this.$nuxtSocket({ persist: 'storiesSocket' })
        .emit('addStory',  `/${storiesAnchor}/${lang}`)
    }
  }
}

export default {
  render(h) {
    return h('aside', {
      staticClass: 'bd-sidebar',
      style: {
        resize: 'horizontal',
        'overflow-x': 'scroll'
      }
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