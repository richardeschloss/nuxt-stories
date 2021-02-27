---
title: Importing Scripts
order: 3
script:
- /Example1.js
- "https://unpkg.com/moment@2.29.1/moment.js"
- _: https://unpkg.com/lodash@4.17.20/lodash.js
---

# Importing Scripts

<div v-if="!$fetchState.pending">
{{ Example1.hello }}

{{ moment() }}

{{ _.find }}
</div>

# How It Works