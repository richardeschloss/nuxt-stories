---
  title: NewStory0
  v: 'I should change dfdfd'
  S: /string.js_fails
  Cperf: snappy fetch.
  cnt: 0
  myArr: [0, 1, 22, 3]
  arr: [{a: 11, b: 2}, {a: 22, b: 11}]
  scripts:
    - https://unpkg.com/lodash@4.17.20/lodash.js
  componentsX:
    A: https://unpkg.com/les-utils@1.0.4/dist/array.js
    S: https://raw.githubusercontent.com/richardeschloss/les-utils/master/dist/string.js
    D: /datetime.js    
    E: '/Example1.js'
    E2: '/Example2.js'
    O: https://unpkg.com/les-utils@1.0.4/dist/object.js
    stats: https://unpkg.com/les-utils@1.0.4/dist/stats.js
---

<input type="number" v-model="cnt"/>

Version?

<div v-if="$nsCache && $nsCache._">{{ $nsCache._.VERSION }}</div>
