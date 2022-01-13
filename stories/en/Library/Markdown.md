---
title: Markdown
order: Infinity
---

# Design

The markdown utilities shall use the following tools for processing markdown content:
| Tool | Description |
| --- | --- |
| [gray-matter](https://npmjs.com/package/gray-matter) | Parsing the frontMatter, and separating it from the content |
| [marked](https://npmjs.com/package/marked) | Parsing the markdown content |
| [highlight.js](https://npmjs.com/package/highlight.js) | Highlighting javascript code blocks |

A [Buffer polyfill](https://npmjs.com/package/buffer) is also used to allow gray-matter to work. It's possible that this [issue](https://github.com/jonschlinkert/gray-matter/pull/132) will eliminate the need for this.

# Tests

<TestRunner testFile="test/specs/Markdown.spec.js" :coverage="true" />

# Coverage

<TestCoverage file="lib/utils/markdown.js" />