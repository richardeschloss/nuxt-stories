import Debug from 'debug'

const debug = Debug('nuxt-stories')

let _Collapse

const preCrud = {
  props: ['story', 'level'],  
  render(h) {
    return h('div', {
      staticClass: 'btn-group float-end d-inline-flex'
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
    async addStory() {
      const added = await (this.$nuxtSocket({ persist: 'storiesSocket' }))
        .emitP('addStory', this.story.href)
      this.$router.push(added.href)
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
  props: ['story', 'level'],
  render(h) {
    let tag, css = 'd-inline-flex align-items-center rounded'
    if (this.level === 0) {
      tag = 'button'
      css = 'btn ' + css
    } else {
      tag = 'a'
    }
    return h('div', {
    }, [
      h(tag, {
        staticClass: css
      }, this.story.name),
      h('div', {
        staticClass: 'btn-group float-end'
      }, [
        h('button', {
          staticClass: 'btn bi-check2 text-danger',
          style: {
            'font-size': '11px'
          },
          on: {
            click: () => this.remove()
          }
        }, ['Delete?']),
        h('button', {
          staticClass: 'btn bi-x',
          style: {
            'font-size': '11px'
          },
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
      const { storiesAnchor, lang } = this.$config.nuxtStories
      this.$nuxtSocket({ persist: 'storiesSocket' })
        .emit('removeStory', this.story.href)
      this.exit()
      this.$router.push(this.story.parent || `/${storiesAnchor}/${lang}`)  
    }  
  }
}

const nodeEdit = {
  props: ['story', 'level'],
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
      this.$router.push(newHref)
    }
  }
}

const storyChildren = {
  props: ['collapse', 'story', 'level'],
  render(h) {
    const { story, level } = this
    return h('div', {
      staticClass: 'collapse',
      on: {
        mouseenter: () => {
          this.$emit('hideCRUD')
        }
      }
    }, [
      h('ul', {
        staticClass: 'list-unstyled fw-normal pb-1 small'
      }, 
        story.children.map(child => {
          return h(storyElm, {
            attrs: {
              story: child,
              level: level + 1
            }
          })
        })
      )
    ])
  }
}

const storyElm = {
  props: {
    story: {
      type: Object
    },
    level: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      deleteMode: false,
      editMode: false,
      showCRUD: false,
      newName: ''
    }
  },
  render(h) {
    const { level, story } = this
    const children = h(storyChildren, {
      attrs: {
        story,
        level
      },
      on: {
        hideCRUD: () => {
          this.showCRUD = false
        }
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
    
    const viewTag = this.level > 0 ? 'a' : 'button'
    let viewCss = 'd-inline-flex align-items-center rounded'
    if (this.level === 0) {
      viewCss = 'btn ' + viewCss
    } 
    
    if (story.href === this.$route.path) {
      viewCss += ' active'
    }
    const storyView = [
      h(viewTag, {
        staticClass: viewCss, // 'btn d-inline-flex align-items-center rounded',
        style: {
          'margin-left': `calc(${this.level} * 1.25em)`
        },
        on: {
          click: () => {
            this.$router.push(story.href)
            collapse.toggle()
          },
          mouseenter: () => {
            this.showCRUD = true
          }
        }
      }, [ 
        story.name,
      ]),
      this.showCRUD
        ? h(preCrud, {
          attrs: { story, level },
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
        attrs: { story, level },
        on: {
          exitRemove: () => {
            this.deleteMode =false
          }
        }
      })
    } else if (this.editMode) {
      mainNode = h(nodeEdit, { 
        attrs: { story, level },
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
      style: {
        cursor: 'pointer'
      },
      on: {
        mouseenter: () => {
          this.showCRUD = true
        },
        mouseleave: () => {
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