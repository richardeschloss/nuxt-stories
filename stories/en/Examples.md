---
title: Your notes
order: 2
items: 
  - Item 1
  - Item 2
  - Item 30
---

# Examples

No explanation really here! This is just a playground for you to toy with Markdown and Vue quickly! Have fun! (live editing will work, but auto saving will currently only work locally, not on my deployed site)


The title: {{ title }} {{ order }}

More stuff here! 

<ul>
<li> Something </li>
<li v-for="item in items">{{ item }} </li>
</ul>