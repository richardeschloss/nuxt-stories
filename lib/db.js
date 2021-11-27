// @ts-nocheck
import L from '@lokidb/loki'
import T from '@lokidb/full-text-search'

const Loki = L.default
const FullTextSearch = T.default
FullTextSearch.register()

export default async function DB({
  fullTextSearchFields = [
    'id',
    'msg',

    // Nuxt-content...
    'title', 
    'description', 
    'slug', 
    'text'
  ],
  nestedProperties = []

}) {
  const db = new Loki('stories.db')
  const itemsOpts = {
    fullTextSearch: fullTextSearchFields.map(field => ({ field })),
    nestedProperties
  }

  const items = db.addCollection(
    'items',
    itemsOpts
  )
  
  items.insert({ id: 123, msg: 'some data' })
  items.insert({ id: 321, msg: 'not' })

  const q = items.chain()
  const h = q.find({
    $fts: {
      query: {
        type: 'bool',
        should: fullTextSearchFields.map(field => ({
          type: 'match',
          field,
          value: 'so',
          prefix_length: 1,
          operator: 'and',
          minimum_should_match: 1,
          fuzziness: 1,
          extended: true
        }))
      }
    }
  }).sortByScoring()

  console.log('hits', h.data())
}