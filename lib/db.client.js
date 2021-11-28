import LokiDB from '@lokidb/loki'
import FullTextSearch from '@lokidb/full-text-search'
FullTextSearch.register()

export default function DB({
  collection = 'stories',
  filename = '/markdown/stories.db',
  // fullTextSearchFields = ['href', 'content'],
  // nestedProperties = [],
}) {
  let db, items
  const svc = {
    async load() {
      const json = await fetch(filename)
        .then(res => res.json())
      db = new LokiDB(filename)
      db.loadJSONObject(json)
      items = db.getCollection(collection)
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
          const r = new RegExp(`(${q})`, 'i')
          const matched = content.match(r)
          const snippet = content.substring(matched.index - 25, matched.index + q.length + 25)
          const snippetParts = snippet.split(matched[0])
          const preview = [snippetParts[0], matched[0], snippetParts[1]]
          return {
            labels,
            content,
            href,
            preview 
          }
        })
    }
  }
  return svc
}