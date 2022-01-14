---
title: Plugin
order: 2
---

# Requirements

## Normal Mode
| Requirement | Description | Notes |
| --- | --- | --- |
| JSON component | It shall register [vue-json-pretty](https://www.npmjs.com/package/vue-json-pretty) as "json" | It works if we see Pretty json: <json :data="{ some: 'data' }" /> |
| Route Guards | Since the story fetching relies on `$route.params.lang` being defined, we need to check the "to" path for the language and if it's missing, add it as well as appending a trailing slash. | |
| Client-side database (static host) | Register LokiDB which is used for the fetching of stories and full text search | |
| Vuex Module | Register $nuxtStories vuex module | Current state: <json :data="$store.state.$nuxtStories" :deep="0" /> |

# Tests
<NuxtStoriesTestRunner testFile="test/specs/Plugin.spec.js" :coverage="true" /> 

# Coverage
<NuxtStoriesTestCoverage file="plugin.js" />