export default {
  require: ['esm', 'module-alias/register'],
  files: [
    // 'test/specs/Fetch.spec.js',
    'test/specs/Import.spec.js',
    // 'test/specs/Markdown.spec.js',
    // 'test/specs/Module.spec.js',
    // 'test/specs/ModuleRegister.spec.js',
    // 'test/specs/Plugin.spec.js',
    // 'test/specs/PluginRegister.spec.js',
    // 'test/specs/StoriesIO.spec.js',
    // 'test/specs/Postinstall.spec.js',
    // 'test/specs/Storage.spec.js',
    // 'test/specs/VuexModule.spec.js',
    // 'test/specs/StoryFactory.spec.js'
  ],
  serial: true,
  ignoredByWatcher: ['lib/stories.plugin.compiled.js', 'tmp', 'stories'],
  tap: false,
  verbose: true
}
