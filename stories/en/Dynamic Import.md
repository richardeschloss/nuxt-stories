---
title: Dynamic Import
components: 
  Example3: /Example3.vue
vues:
  - /Example4.js?vddf
scripts: 
  - /Example1.js
  - https://unpkg.com/moment@2.29.1/moment.js
  - _: https://unpkg.com/lodash@4.17.20/lodash.js
esms: 
  - /Example2.mjs
  - days, msPerDay, today: https://cdn.jsdelivr.net/gh/richardeschloss/les-utils@latest/src/datetime.js
  - https://cdn.jsdelivr.net/gh/richardeschloss/les-utils@latest/src/stats.js
---

| Status: | |
| --- | --- |
| Scripts Fetched | {{ scriptsFetched }} |
| ESMs fetched | {{ esmsFetched }} |
| Vues fetched | {{ vuesFetched }} |

# Importing Vue Components
Example3: 
<example3 />

<div v-if="vuesFetched">
Example4: <example4 />
</div>

# Importing JS (.js or .cjs)
<div v-if="scriptsFetched">
Example1:
We can run Example1 now like: {{ Example1.hello('hi ') }}

Moment date format example: {{ moment().format('MM/DD/yyyy') }}

Lodash version: {{ _.VERSION }} 

Methods: {{ Object.keys(_).slice(0, 5) }} ...(more hidden)
</div>


# Importing ESM (.mjs)
<div v-if="esmsFetched">
today(): {{ today() }}

{{ days }} 

{{ stats.default.mean }}
</div>

