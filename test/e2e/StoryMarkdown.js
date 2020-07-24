import test from 'ava'
import { shallowMount } from '@vue/test-utils'
import StoryMarkdown from '@/lib/components/StoryMarkdown'

test('Story Markdown (state undef)', (t) => {
  const called = {}
  const wrapper = shallowMount(StoryMarkdown, {
    mocks: {
      $store: {},
      $nuxtStories () {
        called.$nuxtStories = true
      }
    }
  })
  const ctx = wrapper.vm
  t.true(called.$nuxtStories)
  t.is(ctx.editorCss, '')
  t.true(ctx.showEditor)
  t.true(ctx.showView)
  t.is(ctx.viewerCss, 'overflow-y-scroll')
  t.is(ctx.viewMode, '')
})

test('Story Markdown (state defined, $nuxtStories state undef)', (t) => {
  const called = {}
  const wrapper = shallowMount(StoryMarkdown, {
    mocks: {
      $store: {
        state: {}
      },
      $nuxtStories () {
        called.$nuxtStories = true
      }
    }
  })
  const ctx = wrapper.vm
  t.true(called.$nuxtStories)
  t.is(ctx.editorCss, '')
  t.true(ctx.showEditor)
  t.true(ctx.showView)
  t.is(ctx.viewerCss, 'overflow-y-scroll')
  t.is(ctx.viewMode, '')
})

test('Story Markdown (viewMode === "view")', (t) => {
  const called = {}
  const wrapper = shallowMount(StoryMarkdown, {
    mocks: {
      $store: {
        state: {
          $nuxtStories: {
            viewMode: 'view'
          }
        }
      },
      $nuxtStories () {
        called.$nuxtStories = true
      }
    }
  })
  const ctx = wrapper.vm
  t.true(called.$nuxtStories)
  t.is(ctx.editorCss, '')
  t.false(ctx.showEditor)
  t.true(ctx.showView)
  t.is(ctx.viewerCss, 'w-100')
  t.is(ctx.viewMode, 'view')
})

test('Story Markdown (viewMode === "edit")', (t) => {
  const called = {}
  const wrapper = shallowMount(StoryMarkdown, {
    mocks: {
      $store: {
        state: {
          $nuxtStories: {
            viewMode: 'edit'
          }
        }
      },
      $nuxtStories () {
        called.$nuxtStories = true
      }
    }
  })
  const ctx = wrapper.vm
  t.true(called.$nuxtStories)
  t.is(ctx.editorCss, 'w-100')
  t.true(ctx.showEditor)
  t.false(ctx.showView)
  t.is(ctx.viewerCss, 'overflow-y-scroll')
  t.is(ctx.viewMode, 'edit')
})
