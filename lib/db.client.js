import LokiDB from '@lokidb/loki'
import LokiDBSearch from '@lokidb/full-text-search'

/* c8 ignore start */
const Loki = LokiDB.default || LokiDB
const FullTextSearch = LokiDBSearch.FullTextSearch || LokiDBSearch
FullTextSearch.register()
/* c8 ignore stop */

export default function DB({
  collection = 'stories',
  filename = '/markdown/stories.db'
} = {}) {
  let db, items
  const svc = {
    async load() {
      const json = await fetch(filename)
        .then(res => res.json())
      db = new Loki(filename)
      db.loadJSONObject(json)
      items = db.getCollection(collection)
      return items.count()
    },
    async search(q) {
      return await items
        .chain()
        .find({
          $fts: {
            query: {
              type: 'match',
              field: 'content',
              value: q,
              fuzziness: 1,
              extended: true,
              minimum_should_match: 1
            }
          }
        })
        .sortByScoring()
        .data()
        .map(({ labels, href, content }) => {
          const out = { labels, href, content }
          const r = new RegExp(`(${q})`, 'i')
          const matched = content.match(r)
          if (matched) {
            const snippet = content.substring(matched.index - 25, matched.index + q.length + 25)
            const snippetParts = snippet.split(matched[0])
            out.preview = [snippetParts[0], matched[0], snippetParts[1]]
          }
          return out
        })
    }
  }
  return svc
}