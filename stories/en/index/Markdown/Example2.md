---
title: Hello I'm your front matter
slug: home
order: 20
items: 
  - { name: item 6 }
  - { name: item 2 }
  - { name: item 3 }
---

Here's the slug...: {{ slug }} 

A table a different way:
<b-table-lite :items="[{
msg: 'hi', meaning: 'salutation'
}]" />

Actually, items here:
<b-table-lite :items="items" />

# Example 2
Just the component: <stories-logo />

## Excitement:
Ok, let's do better!!

### Sub Header:

> I am using marked

Code with language specified:

```js
var a = 123
console.log('some code')
```

Code without language specified:

```
var a = 123
```

* Here's a table with the components:
| name | view |
| --- | --- |
| logo | <stories-logo /> |
| logo (100) | <stories-logo width="120" /> |

Can we do better?

Another logo? <stories-logo/>

Header? 
<stories-header v-show="true"></stories-header>

### Test
Test 123

### Cards
<b-card
  header="Featured"
  header-tag="header"
  footer="Card Footer"
  footer-tag="footer"
  title="Title">
  <b-card-text>Header and footers using props.</b-card-text>
  <b-button href="#" variant="primary">Go somewhere</b-button>
</b-card>

Navbar here:
<navbar></navbar>