---
title: Plugin
order: 2
---

# Requirements

## Normal Mode
| Requirement | Description | Notes |
| --- | --- | --- |
| Register components | It shall register [vue-json-pretty](https://www.npmjs.com/package/vue-json-pretty) as "json". It may also register TestRunner, TestCoverage and Readme components | It works if we see Pretty json: <json :data="{ some: 'data' }" />. The other components are used/viewed throughout these stories |
| Client-side database (static host) | Register LokiDB which is used for the fetching of stories and full text search | |
| Stories State | Register $nuxtStories state with `useState` | Current state: <json :data="$nuxtStories().value" :deep="1" /> |
| error and warn handlers | Register `nuxtApp.vueApp.errorHandler` and `nuxtApp.vueApp.warnHandler` since we're compiling on-the-fly and will want to gracefully handle errors | 

# Tests
<TestRunner testFile="test/specs/Plugin.spec.js" :coverage="true" /> 

# Coverage
<TestCoverage file="lib/plugin.js" />