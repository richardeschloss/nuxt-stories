---
  title: Calculations (quick updating!)
  order: 2
  items: 
    - unitCost: 1.22
      qty: 10
    - unitCost: 1.5
      qty: 11
    - unitCost: 22.22
      qty: 100
    - unitCost: 1.5
      qty: 11
---

So here, we have a very basic table:

<table class="table">
  <tr>
    <th>Unit Cost</th>
    <th>Qty</th>
    <th>Total</th>
  </tr>
  <tr v-for="item in items">
    <td>{{item.unitCost}}</td>
    <td>{{item.qty}}</td>
    <td>{{item.unitCost * item.qty}}</td>
</table>

We could probably create a component out it if we like:
```js
export default {
  props: {
    items: { ... }
  }
}
```

And have it documented here how it would be used:
```html
<auto-calc-table :items="items" />
```

This is one story point. Bootstrap vue already has a component like this:

<b-table-lite :items="items" />

So now, when we update the data above, ALL parts in the story will change that depend on that!




