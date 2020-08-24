export default {
  require: ['@babel/register', './test/e2e.setup'],
  files: [
    'test/e2e/Breadcrumbs.js',
    'test/e2e/Markdown.js',
    'test/e2e/StoriesContent.js',
    'test/e2e/StoriesHeader.js',
    'test/e2e/StoriesLogo.js',
    'test/e2e/StoryContent.js',
    'test/e2e/StoryMarkdown.js',
    'test/e2e/StoryNav.js',
    'test/e2e/StoryNavItem.js',
    'test/e2e/StoryToc.js'
  ],
  tap: false,
  verbose: true
}
