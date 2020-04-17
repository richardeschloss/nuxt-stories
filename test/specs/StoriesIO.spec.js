import test from 'ava'
import StoriesIO from '@/lib/stories.io'

test('Save Markdown', (t) => {
  const storiesIO = StoriesIO()
  t.truthy(storiesIO.saveMarkdown)
})