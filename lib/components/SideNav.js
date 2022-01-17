/* eslint-disable camelcase */
import { h } from 'vue'
import Debug from 'debug'
import { delay } from 'les-utils/utils/promise.js'
import Collapse from './Collapse.js'
import Svg from './Svg.js'

const debug = Debug('nuxt-stories')

const preCrud = {
  props: ['story', 'level'],
  render () {
    return h('div', {
      class: 'btn-group float-end d-inline-flex'
    }, [
      h('button', {
        class: 'btn',
        onClick: () => this.addStory()
      }, [
        h(Svg, {
          icon: 'plus'
        })
      ]),
      h('button', {
        class: 'btn',
        onClick: () => this.preRename()
      }, [
        h(Svg, {
          icon: 'pencil'
        })
      ]),
      h('button', {
        class: 'btn',
        onClick: () => this.preRemove()
      }, [
        h(Svg, {
          icon: 'trash'
        })
      ])
    ])
  },
  methods: {
    async addStory () {
      const added = await (this.$nuxtSocket({
        name: 'nuxtStories',
        persist: 'storiesSocket'
      }))
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
  render () {
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
        class: css,
        style: {
          'margin-left': `calc(${this.level} * 1.25em)`
        }
      }, this.story.name),
      h('div', {
        class: 'btn-group float-end'
      }, [
        h('button', {
          class: 'btn',
          style: {
            color: 'red',
            'font-size': '11px'
          },
          onClick: () => this.remove()
        }, [
          h(Svg, {
            icon: 'check2'
          }),
          ' Delete?'
        ]),
        h('button', {
          class: 'btn',
          style: {
            'font-size': '11px'
          },
          onClick: () => this.exit()
        }, [
          h(Svg, {
            icon: 'x'
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
      this.$nuxtSocket({
        name: 'nuxtStories',
        persist: 'storiesSocket'
      })
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
  render () {
    const { story } = this
    return h('div', [
      h('input', {
        class: 'form-control',
        value: story.name,
        onInput: (evt) => {
          this.newName = evt.target.value
        },
        onKeyup: (evt) => {
          if (evt.key === 'Enter') {
            this.rename()
          }
        },
        onBlur: () => this.exit()
      }),
      h('div', {
        class: 'btn-group'
      }, [
        h('button', {
          class: 'btn',
          onClick: () => this.rename()
        }, [
          h(Svg, {
            icon: 'check2'
          })
        ]),
        h('button', {
          class: 'btn',
          onClick: () => this.exit()
        }, h(Svg, {
          icon: 'x'
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
      this.$nuxtSocket({ name: 'nuxtStories', persist: 'storiesSocket' })
        .emit('renameStory', { oldHref, newHref })
      this.exit()
      this.$router.push(newHref)
    }
  }
}

const storyChildren = {
  props: ['collapse', 'story', 'level', 'show'],
  render () {
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
    return h(Collapse, {
      show,
      onMouseenter: () => {
        this.$emit('hideCRUD')
      }
    }, () => [
      h('ul', {
        class: 'list-unstyled fw-normal pb-1 small'
      },
      sortedChildren.map((child) => {
        return h(storyElm, {
          story: child,
          level: level + 1
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
      newName: '',
      fetchingStory: false
    }
  },
  computed: {
    activeStory () {
      return this.$nuxtStories().value?.activeStory
    }
  },
  render () {
    const { level, story } = this
    const { staticHost } = this.$config.nuxtStories
    const childrenId = story.href
      .split('/')
      .slice(3)
      .join('-')
      .replace(/[/\s]/g, '-')

    const childrenAttrs = {
      story,
      level,
      id: childrenId,
      show: this.showChildren
    }
    if (!staticHost) {
      childrenAttrs.onHideCRUD = () => {
        this.showCRUD = false
      }
    }
    const children = h(storyChildren, childrenAttrs)

    const viewTag = this.level > 0 ? 'a' : 'button'
    let viewCss = 'd-inline-flex align-items-center rounded'
    if (this.level === 0) {
      viewCss = 'btn ' + viewCss
    }

    if (story.href === decodeURIComponent(this.$route.path)) {
      viewCss += ' active'
      if (story.href !== this.activeStory?.href &&
        !this.fetchingStory) {
        this.fetchStory(story.href)
      }
    }
    const onPreCrudL0_text = {}
    const onPreCrudL0_li = {}
    if (!staticHost) {
      onPreCrudL0_text.onMouseenter = () => {
        this.showCRUD = true
      }
      onPreCrudL0_li.onMouseleave = () => {
        this.showCRUD = false
      }
    }

    const storyView = [
      h(viewTag, {
        class: viewCss,
        style: {
          'margin-left': `calc(${this.level} * 1.25em)`
        },
        onClick: async (evt) => {
          evt.preventDefault()
          const oldTop = document.getElementById('bd-docs-nav').scrollTop
          this.$nuxtStories().value.showOverflow = false
          this.showChildren = !this.showChildren
          this.$router.push(story.href)
          await delay(100) // TBD: ugly hack for now :(
          document.getElementById('bd-docs-nav').scrollTop = oldTop
        },
        ...onPreCrudL0_text
      }, [
        story.name
      ]),
      this.showCRUD
        ? h(preCrud, {
          story,
          level,
          onEnterEdit: () => {
            this.editMode = true
          },
          onEnterRemove: () => {
            this.deleteMode = true
          }
        })
        : null
    ]
    let mainNode
    if (this.deleteMode) {
      mainNode = h(nodeRemove, {
        story,
        level,
        onExitRemove: () => {
          this.deleteMode = false
        }
      })
    } else if (this.editMode) {
      mainNode = h(nodeEdit, {
        story,
        level,
        onExitEdit: () => {
          this.editMode = false
        }
      })
    } else {
      mainNode = [...storyView]
    }

    return h('li', {
      class: 'mb-1',
      style: {
        cursor: 'pointer'
      },
      ...onPreCrudL0_li
    }, [
      mainNode,
      children
    ])
  },
  watch: {
    '$route.path' (n) {
      const currentHref = decodeURIComponent(n)
      this.showChildren = currentHref.startsWith(this.story.href)
    }
  },
  mounted () {
    const currentHref = decodeURIComponent(this.$route.path)
    this.showChildren = currentHref.startsWith(this.story.href)
  },
  methods: {
    async fetchStory (href) {
      this.fetchingStory = true
      this.$nuxtStories().value.activeStory = null
      const { staticHost, db } = this.$config.nuxtStories
      let story
      if (!staticHost) {
        const socket = this.$nuxtSocket({
          name: 'nuxtStories',
          // @ts-ignore
          persist: 'storiesSocket',
          channel: ''
        })
        // @ts-ignore
        story = await socket.emitP('fetchStory', href)
      } else {
        let useDb = db
        if (!useDb) {
          const { register } = await import('../plugin.js')
          useDb = await register.db()
        }
        story = await useDb.loadStory({ href })
      }
      this.$nuxtStories().value.activeStory = story
      this.fetchingStory = false
    }
  }
}

const storiesTree = {
  render () {
    debug('[SideNav] stories', this.stories)
    const { staticHost } = this.$config.nuxtStories
    const storyElms = this.sortedStories
      .map(story =>
        h(storyElm, { story })
      )

    return h('ul', {
      class: 'list-unstyled mb-0 py-3 pt-md-1'
    }, [
      ...storyElms,
      staticHost
        ? null
        : h('li', [
          h('button', {
            class: 'btn',
            style: {
              color: '#0a53be'
            },
            onClick: () => this.addStory()
          }, ' + ADD STORY')
        ]),
      h('hr'),
      h('button', {
        class: 'btn d-inline-flex align-items-center rounded',
        onClick: () => {
          this.$router.push('/')
        }
      }, 'App')
    ])
  },
  computed: {
    stories () {
      return this.$nuxtStories().value?.stories
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
      this.$nuxtSocket({ name: 'nuxtStories', persist: 'storiesSocket' })
        .emit('addStory', `/${storiesAnchor}/${lang}`)
    }
  }
}

export default {
  computed: {
    toggle () {
      return this.$nuxtStories().value?.showOverflow
    }
  },
  render () {
    return h('aside', {
      class: 'bd-sidebar',
      style: {
        resize: 'horizontal',
        'overflow-x': 'scroll'
      }
    }, [
      h('nav', {
        class: 'collapse bd-links' +
          (this.toggle ? ' show' : ''),
        id: 'bd-docs-nav'
      }, [h(storiesTree)])
    ])
  }
}
