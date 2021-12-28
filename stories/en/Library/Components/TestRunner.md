---
title: TestRunner
order: Infinity
---

# Design

The test runner component is designed to help bring the tests right to the UI, while abstracting out the actual test framework and command.

# Props

| Prop | Type | Default |
| --- | --- | --- |
| testFile | String | '' |
| testCmd | String | 'ava' |
| coverage | Boolean | false |
 
# Demo

<NuxtStoriesTestRunner testFile="test/specs/Module.spec.js" />