---
  title: Data input stuff
  order: 20
  items: 
    - { name: item 1 }
    - { name: item 2 }
    - { name: item 10 }
    - { name: item 200 }
    - { name: item 1 }
    - { name: item 2 }
    - { name: item 10 }
---

The section at the top of each story is called "front matter". For the stories, front matter is specifically used to provide data into our stories. So, I can refer to the title in multiple places, but only change it *one* place.. 

Title:

{{ title }}

*{{ title }}*

**{{ title }}**

So, changing the data at the top should change all instances quickly

Bingo. 

We can also dynamically add more data using frontmatter syntax. (read their docs). Basically, three dashes, and write data as it feels natural to do so...

So, we just declared items above as {{ items }}

We can pretty print those like:
<ul>
<li v-for="item in items">{{item.name}}</li>
</ul>

Or maybe even better:
<b-table-lite :items="items" />







