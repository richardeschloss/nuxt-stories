// @ts-nocheck
import { readFileSync } from 'fs'
import LokiDB from '@lokidb/loki'
import LokiDBSearch from '@lokidb/full-text-search'

const { default: Loki } = LokiDB
const { default: FullTextSearch } = LokiDBSearch
FullTextSearch.register()

export default function DB({
  filename = 'stories.db',
  fullTextSearchFields = [
    'href',
    'content',
  ],
  nestedProperties = []

}) {
  const db = new Loki(filename)
  const items = db.addCollection('items', {
    fullTextSearch: fullTextSearchFields.map(field => ({ field })),
    nestedProperties
  })

  const svc = {
    find: () => items.chain().find().data(),
    initFromFS(files, srcDir, storiesDir, lang) {
      items.clear()
      const entries = files.map((file) => {
        const relPath = file.split(srcDir)[1].replace('.md', '')
        const labels = relPath.split(`/${storiesDir}/${lang}/`)[1]
          .split('/')

        return {
          labels,
          href: relPath,
          content: readFileSync(file, { encoding: 'utf-8' })
        }
      })
      items.insert(entries)
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
  return Object.freeze(svc)
}