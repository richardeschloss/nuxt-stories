// @ts-nocheck
import fs from 'fs'
import path from 'path'
import LokiDB from '@lokidb/loki'
import LokiDBSearch from '@lokidb/full-text-search'

const { default: Loki } = LokiDB
const { default: FullTextSearch } = LokiDBSearch
FullTextSearch.register()

export default async function DB({
  fullTextSearchFields = [
    // 'id',
    // 'msg',
    'content',

    // Nuxt-content...
    // 'title', 
    // 'description', 
    // 'slug', 
    // 'text'
  ],
  nestedProperties = []

}) {
  const db = new Loki('stories.db')
  // console.log('db', db.filename)
  const itemsOpts = {
    fullTextSearch: fullTextSearchFields.map(field => ({ field })),
    nestedProperties
  }

  const items = db.addCollection(
    'items',
    itemsOpts
  )
  const c = fs.readFileSync('./stories/en/Developers.md', { encoding: 'utf-8' })
  
  items.insert(
    [
      { id: 123, content: 'some data' },
      { id: 321, content: 'not' },
      { id: 'Developers', content: c, path: '/stories/en/Developers' }
  ])

  const searchQ = 'Test'
  const q = items.chain()
  const h = q.find({
    $fts: {
      query: {
        type: 'match',
        field: 'content',
        value: searchQ,
        fuzziness: 1,
        extended: true,
        minimum_should_match: 1
      }
    }
  }).sortByScoring()

  const hits = h.data()
  console.log('hits', hits)
  // const matched = hits[0].content.match(searchQ)
  // console.log(hits[0].content.substring(
  //   matched.index - 25, matched.index + 25)
  // )
}