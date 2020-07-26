# Change Log
All notable changes to this project will be documented in this file.

## [2.0.4] - 2020-07-26
### Changed
- Reverted README from a symlink to the docs back to a hard markdown file (npm doesn't like it as a symlink)

## [2.0.3] - 2020-07-26
### Added
- A dummy "hello" component to this project. Type `<hello />` in the online demo to see it appear. Nothing exciting, just the easiest thing to quickly see. 

### Fixed
- Issue with vue stories missing (i.e., only markdown stories)
- Issue with generated routes

## [2.0.2] - 2020-07-25
### Added
- Notes about dompurity (and recommendations)
- Setup notes for nuxt-socket-io

### Changed
- README.md is now a symbolic link to the docs front page. Avoid duplicated efforts

## [2.0.1] - 2020-07-24
### Added
- Added to postinstall script to auto-create vuex store and components folder if they don't already exist.

### Changed
- Upgraded some devDeps to deps so hopefully they get installed with just installing "nuxt-stories". If not, the deps were listed on step 1 of the setup docs.

## [2.0.0] - 2020-07-23
### Added
- Created a new "stories" layout to be used entirely for the stories.
- Language-specific stories. Stories directory now contains language sub-directories, so the specified language "lang" will use the stories for the selected language. Currently "en" is default.
- Added graymatter and highlight.js dependencies for frontmatter and markdown processing.
- Added Nuxt Stories Logo.
- Added autoImport of components. The nuxt-stories plugin auto register its components that it uses for the stories UI and also any components in the app's components folder; i.e., it registers "[nuxt-stories]/lib/components" and "[appRoot]/components"
- Added a "StoryMarkdown" component that allows insanely fast live-editing of stories right on the UI...in a combined Markdown / Vue! See your stories get compiled insanely fast!
- Added markdown utilities to support the markdown processing. Easy to reuse
- Added an IO service that will listen for changes made to the stories on the UI and save those changes back to the filesystem. So you can edit right on the UI and have everything saved automatically. Editing has never been faster! (this IO service can pave the way for future improvements, such as story CRUD operations on the UI)
- Added tests, tested the unit tests to 100% cov, e2e tests pass too.

### Changed
- Stuck with Bootstrap for theming, since it includes many icons and utility classes, and is actually far easier to use for storybooking than Tailwind. I redesigned the UI to better match the look and feel of BootstrapVue docs. Similar but not exactly the same.
- Renamed "modules" to "lib". The new main file will be "lib/stories.module.js"
- Changed the default stories directory from ".stories" to "stories", since the benefit of hiding the stories directory really wasn't worth much, and made things more difficult to work with. The "storiesDir" option is still there if people want to change it.
- Changed the postinstall script to also copy over assets and layouts so it's easier for the Nuxt app to use.
- Updated deployed docs.

## [1.0.6] - 2020-01-24
### Changed
- Minor change: replaced the `v-compiled` directive with `v-html`

## [1.0.5] - 2020-01-23

### Fixed
- Issue with markdown.vue component. Changes were not being shown after hot-module-reload, but now they are.

## [1.0.4] - 2020-01-21

### Changed
- Bumped dev deps "marked" and "dompurify" to deps.

## [1.0.3] - 2020-01-21

### Added
- Custom renderer for tables in Markdown feature. It will produce the bootstrap striped table. Easy to modify if needed.

## [1.0.2] - 2020-01-21

### Added
- Markdown feature. So now, the stories can be mixed markdown and vue components! Pretty rad!

## [1.0.1] - 2019-11-19

### Added

- Improved Test coverage. Now at 100% on both module and plugin
- Added test utils

### Changed

- Badge dashboard format

## See Also:

[Releases](https://github.com/richardeschloss/nuxt-stories/releases) 
