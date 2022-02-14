export default {
  serial: true,
  files: [
    'test/specs/DB.spec.js',
    'test/specs/Module.spec.js',
    'test/specs/Plugin.spec.js',
    'test/specs/IO.spec.js',
    'test/specs/Markdown.spec.js',
    'test/specs/Fetch.spec.js',
    'test/specs/Storage.spec.js',
    'test/specs/VuexModule.spec.js',
    'test/specs/StoryFactory.spec.js'
  ],
  ignoredByWatcher: ['stories', 'lib'],
  nodeArguments: [
    '--experimental-loader=./test/utils/loaders.js'
  ],
  tap: false,
  verbose: true
}
