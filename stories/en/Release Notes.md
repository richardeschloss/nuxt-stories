---
title: Release Notes
order: Infinity
---

# Change Log
All notable changes to this project will be documented in this file.

## v3.x - TBD
* on-going 3.x support... 

## v2.5.0 - TBD
* Major change to ESM from commonjs.
* Major UI design changes to scope styles to nuxt-stories and carry in some styles I liked from bootstrap-docs. Cleaned up the UI and how the SCSS files are organized. It's much cleaner now. The module no longer adds the styles globally, but rather *only* the Nuxt-stories root component imports the styles it needs.
* Cleaned up the sidebar. Now it does a better job of matching the stories directory tree. It used to be limited to a depth of 2, but now there is no limit. Also, the adding, renaming and deleting of stories is easier. Even changing the title in the frontMatter will rename the story. Can be a timesaver.
* Deprecated the "Vue-first" stories. Only stories written in Markdown will be supported. It's the better way to go! Easier to maintain the code and easier to maintain the stories!
* Added LokiDB to help with caching of stories and indexing for the full text search feature
* Added chokidar to watch for changes made to  stories on the filesystem. This way changes on either the UI or the filesystem appear on the UI instantly. 
* Added automated scrolling to sections for both the viewer and editor. The scrolling works whenever the current route's hash changes (and that hash is valid).
* Made the Language dropdown functional
* Improved code organization across the board. Many more components were created and code was moved to where it better fit.
* Removed the stories layout. No longer needed.

## v2.0.17 - 2021-06-16
### Changed
- Improved error handling for the autoImport feature.

## v2.0.16 - 2021-05-17
### Added
- Cors options wired to socket.io reg.

## v2.0.15 - 2021-03-04
### Fixed
- Stories with spaces (stripped HTML entities in paths).

## v2.0.14 - 2021-03-02
### Added
- Dynamic import feature. (specify imports in frontMatter)
- Pretty json viewer

## v2.0.13 - 2021-01-27
### Added
- Fetch feature. (fetch and nodeFetch in frontMatter)
- Improved error handling for on-the-fly compilation errors.

## v2.0.12 - 2021-01-15
### Fixed
- Fixed the children paths when parents get renamed

## v2.0.11 - 2021-01-15
### Fixed
- b-link behavior with the newest bootstrap-vue

## v2.0.10 - 2021-01-12
### Fixed
- Path resolution of routes and stories on Windows

## v2.0.9 - 2020-09-18
### Fixed
- Fixed postinstall copying of sample stories

## v2.0.8 - 2020-08-28
### Fixed
- Ordering issue of stories

## v2.0.7 - 2020-08-24
### Added
- CRUD operations for stories (add, rename, remove)
- CRUD controls on the UI when the host is running a socket.io server

### Changed
- Changed how stories are fetched: either from a static host or a vdefault socket.io host

## v2.0.6 - 2020-07-31
### Changed
- Upgraded dependencies, including Nuxt to 2.14. So nuxt generate uses the new full static target.
- Updated nuxt.config to use the new nuxt generate.
- Ran security audit, addressed the issues.

## v2.0.5 - 2020-07-30
### Fixed
- postinstall script only copies sample stories once now

## v2.0.4 - 2020-07-26
### Changed
- README.md is back to a hard file. Not a symlink (npm doesn't like that)

## v2.0.3 - 2020-07-26
### Added
- A dummy "hello" component to this project. Type `<hello />` in the online demo to see it appear. Nothing exciting, just the easiest thing to quickly see. 

### Fixed
- Issue with vue stories missing (i.e., only markdown stories)
- Issue with generated routes

## v2.0.2 - 2020-07-25
### Added
- Notes about dompurity (and recommendations)
- Setup notes for nuxt-socket-io

### Changed
- README.md is now a symbolic link to the docs front page. Avoid duplicated efforts

## v2.0.1 - 2020-07-24
### Added
- Added to postinstall script to auto-create vuex store and components folder if they don't already exist.

### Changed
- Upgraded some devDeps to deps so hopefully they get installed with just installing "nuxt-stories". If not, the deps were listed on step 1 of the setup docs.

## v2.0.0 - 2020-07-23
### Added
- Created a new "stories" layout to be used entirely for the stories.
- Language-specific stories. Stories directory now contains language sub-directories, so the specified language "lang" will use the stories for the selected language. Currently "en" is default.
- Added graymatter and highlight.js dependencies for frontmatter and markdown processing.
- Added Nuxt Stories Logo.
- Added autoImport of components. The nuxt-stories plugin auto register its components that it uses for the stories UI and also any components in the app's components folder; i.e., it registers "vnuxt-stories/lib/components" and "vappRoot/components"
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

## v1.0.6 - 2020-01-24
### Changed
- Minor change: replaced the `v-compiled` directive with `v-html`

## v1.0.5 - 2020-01-23

### Fixed
- Issue with markdown.vue component. Changes were not being shown after hot-module-reload, but now they are.

## v1.0.4 - 2020-01-21

### Changed
- Bumped dev deps "marked" and "dompurify" to deps.

## v1.0.3 - 2020-01-21

### Added
- Custom renderer for tables in Markdown feature. It will produce the bootstrap striped table. Easy to modify if needed.

## v1.0.2 - 2020-01-21

### Added
- Markdown feature. So now, the stories can be mixed markdown and vue components! Pretty rad!

## v1.0.1 - 2019-11-19

### Added

- Improved Test coverage. Now at 100% on both module and plugin
- Added test utils

### Changed

- Badge dashboard format

## See Also:

[Releases](https://github.com/richardeschloss/nuxt-stories/releases) 

