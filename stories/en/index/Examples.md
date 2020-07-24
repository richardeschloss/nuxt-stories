---
title: Your notes
order: 2
items: 
  - Item 1
  - Item 2
  - Item 30
---

# Examples
...
The title: {{ title }} {{ order }}

1. Persist the state... consider vuex-persist? 
1. Eventually get the search feature implemented.
1. Hide viewMode controls in production
1. It helps to run "npm run deploy:local". This links lib to "nuxt-stories" in node_modules so that I can use import it and use like a user would.

More stuff here! 

<ul>
<li> Something </li>
<li v-for="item in items">{{ item }} </li>
</ul>