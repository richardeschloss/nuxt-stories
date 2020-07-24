---
title: Example 3
order: 3
fruits: 
  - apple
  - banana
  - pineapple
---

# Example 3

This should look *very* different!

Some fruits:
<ul v-for="fruit in fruits">
  <li>{{ fruit }} </li>
</ul>

## Appearance?

Yes it's different

Different? Yeah!


And with a different home:
<navbar 
stories-home=".stories" :showNav="true"></navbar>
