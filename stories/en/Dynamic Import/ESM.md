---
title: Importing ESM
order: 1
esm:
- /Example2.mjs
- SimpleCart, named1 as n1: /Example2.mjs
- /Example4.js
---

# Importing ESM (.mjs)

<div v-if="!$fetchState.pending">
<json :data="Example2" />

{{ Example2.fn2() }}

{{ n1() }}

<json :data="SimpleCart" />

</div>

# Importing Vue (.mjs)
<Example4 />

{{ Example4 }}

# How it works
