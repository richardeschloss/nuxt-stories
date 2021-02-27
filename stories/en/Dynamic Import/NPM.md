---
title: Importing NPM
order: 2
npm:
- filter as f, min, max: lodash-es
---

# Importing NPM
<div v-if="!$fetchState.pending">
Max: {{ max([4,44,3,3]) }}

Filter: {{ f([{a: 1}, {a: 1}, {a: 2}], {a:1})}}
</div>