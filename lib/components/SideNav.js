import Debug from 'debug'

const debug = Debug('nuxt-stories')

const preCrud = {
  props: ['story', 'level'],
  render (h) {
    return h('div', {
      staticClass: 'btn-group float-end d-inline-flex'
    }, [
      h('button', {
        staticClass: 'btn',
        on: {
          click: () => this.addStory()
        }
      }, [
        h('LazyNuxtStoriesSvg', {
          attrs: {
            icon: 'plus'
          }
        })
      ]),
      h('button', {
        staticClass: 'btn',
        on: {
          click: () => this.preRename()
        }
      }, [
        h('LazyNuxtStoriesSvg', {
          attrs: {
            icon: 'pencil'
          }
        })
      ]),
      h('button', {
        staticClass: 'btn',
        on: {
          click: () => this.preRemove()
        }
      }, [
        h('LazyNuxtStoriesSvg', {
          attrs: {
            icon: 'trash'
          }
        })
      ])
    ])
  },
  methods: {
    async addStory () {
      const added = await (this.$nuxtSocket({ persist: 'storiesSocket' }))
        .emitP('addStory', this.story.href)

      this.$router.push(added.href)
    },
    preRename () {
      this.$emit('enterEdit')
    },
    preRemove () {
      this.$emit('enterRemove')
    }
  }
}

const nodeRemove = {
  props: ['story', 'level'],
  render (h) {
    let tag; let css = 'd-inline-flex align-items-center rounded'
    if (this.level === 0) {
      tag = 'button'
      css = 'btn ' + css
    } else {
      tag = 'a'
    }
    return h('div', {
    }, [
      h(tag, {
        staticClass: css,
        style: {
          'margin-left': `calc(${this.level} * 1.25em)`
        }
      }, this.story.name),
      h('div', {
        staticClass: 'btn-group float-end'
      }, [
        h('button', {
          staticClass: 'btn',
          style: {
            color: 'red',
            'font-size': '11px'
          },
          on: {
            click: () => this.remove()
          }
        }, [
          h('LazyNuxtStoriesSvg', {
            attrs: {
              icon: 'check2'
            }
          }),
          ' Delete?'
        ]),
        h('button', {
          staticClass: 'btn',
          style: {
            'font-size': '11px'
          },
          on: {
            click: () => this.exit()
          }
        }, [
          h('LazyNuxtStoriesSvg', {
            attrs: {
              icon: 'x'
            }
          }),
          ' Cancel'
        ])
      ])
    ])
  },
  methods: {
    exit () {
      this.$emit('exitRemove')
    },
    remove () {
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
  data () {
    return {
      newName: ''
    }
  },
  render (h) {
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
          staticClass: 'btn',
          on: {
            click: () => this.rename()
          }
        }, [
          h('LazyNuxtStoriesSvg', {
            attrs: {
              icon: 'check2'
            }
          })
        ]),
        h('button', {
          staticClass: 'btn',
          on: {
            click: () => this.exit()
          }
        }, h('LazyNuxtStoriesSvg', {
          attrs: {
            icon: 'x'
          }
        }))
      ])
    ])
  },
  methods: {
    exit () {
      this.newName = ''
      this.$emit('exitEdit')
    },
    rename () {
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
  props: ['collapse', 'story', 'level', 'show'],
  render (h) {
    const { story, level, show } = this
    const sortedChildren = [...story.children]
    sortedChildren.sort((a, b) => {
      if (a.order > b.order) {
        return 1
      } else if (a.order < b.order) {
        return -1
      }
      return 0
    })
    return h('NuxtStoriesCollapse', {
      attrs: {
        show
      },
      on: {
        mouseenter: () => {
          this.$emit('hideCRUD')
        }
      }
    }, [
      h('ul', {
        staticClass: 'list-unstyled fw-normal pb-1 small'
      },
      sortedChildren.map((child) => {
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
  data () {
    return {
      deleteMode: false,
      editMode: false,
      showCRUD: false,
      showChildren: false,
      newName: ''
    }
  },
  render (h) {
    const { level, story } = this
    const { staticHost } = this.$config.nuxtStories
    const childrenEvts = {}
    if (!staticHost) {
      Object.assign(childrenEvts, {
        hideCRUD: () => {
          this.showCRUD = false
        }
      })
    }
    const childrenId = story.href
      .split('/')
      .slice(3)
      .join('-')
      .replace(/[\/\s]/g, '-')
    const children = h(storyChildren, {
      attrs: {
        story,
        level,
        id: childrenId,
        show: this.showChildren
      },
      on: childrenEvts
    })

    const viewTag = this.level > 0 ? 'a' : 'button'
    let viewCss = 'd-inline-flex align-items-center rounded'
    if (this.level === 0) {
      viewCss = 'btn ' + viewCss
    }

    if (story.href === decodeURIComponent(this.$route.path)) {
      viewCss += ' active'
      // Dispatch "fetch story"
      // Action will commit the active story
      this.$store.dispatch(
        '$nuxtStories/FETCH_STORY',
        story.href
      )
    }
    const onPreCrudL0_text = {}
    const onPreCrudL0_li = {}
    if (!staticHost) {
      Object.assign(onPreCrudL0_text, {
        mouseenter: () => {
          this.showCRUD = true
        }
      })
      Object.assign(onPreCrudL0_li, {
        mouseleave: () => {
          this.showCRUD = false
        }
      })
    }

    const storyView = [
      h(viewTag, {
        staticClass: viewCss,
        style: {
          'margin-left': `calc(${this.level} * 1.25em)`
        },
        on: {
          click: () => {
            this.showChildren = !this.showChildren
            this.$router.push(story.href)
            this.$store.dispatch(
              '$nuxtStories/FETCH_STORY',
              story.href
            )
          },
          ...onPreCrudL0_text
        }
      }, [
        story.name
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
            this.deleteMode = false
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
      mainNode = [...storyView]
    }

    return h('li', {
      staticClass: 'mb-1',
      style: {
        cursor: 'pointer'
      },
      on: {
        ...onPreCrudL0_li
      }
    }, [
      mainNode,
      children
    ])
  },
  watch: {
    '$route.path' (n) {
      const currentHref = decodeURIComponent(this.$route.path)
      this.showChildren = currentHref.startsWith(this.story.href)
    }
  },
  mounted () {
    const currentHref = decodeURIComponent(this.$route.path)
    this.showChildren = currentHref.startsWith(this.story.href)
  }
}

const storiesTree = {
  render (h) {
    debug('[SideNav] stories', this.stories)
    const { staticHost } = this.$config.nuxtStories
    const storyElms = this.sortedStories
      .map(story =>
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
      staticHost
        ? h()
        : h('li', [
          h('button', {
            staticClass: 'btn',
            style: {
              color: '#0a53be'
            },
            on: {
              click: () => this.addStory()
            }
          }, ' + ADD STORY')
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
    stories () {
      return this.$store.state && this.$store.state.$nuxtStories
        ? this.$store.state.$nuxtStories.stories
        : []
    },
    sortedStories () {
      const copy = [...this.stories]
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
    addStory () {
      const {
        storiesAnchor
      } = this.$config.nuxtStories
      const { lang } = this.$route.params
      this.$nuxtSocket({ persist: 'storiesSocket' })
        .emit('addStory', `/${storiesAnchor}/${lang}`)
    }
  }
}

export default {
  data () {
    return {
      toggle: false
    }
  },
  render (h) {
    this.$root.$on('nuxtStories_toggleSideNav', (val) => {
      this.toggle = val
    })
    return h('aside', {
      staticClass: 'bd-sidebar',
      style: {
        resize: 'horizontal',
        'overflow-x': 'scroll'
      }
    }, [
      h('nav', {
        staticClass: 'collapse bd-links',
        class: {
          show: this.toggle
        },
        attrs: {
          id: 'bd-docs-nav'
        }
      }, [h(storiesTree)])
    ])
  }
}
