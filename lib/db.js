// @ts-nocheck
import { readFileSync } from 'fs'
import LokiDB from '@lokidb/loki'
import LokiDBSearch from '@lokidb/full-text-search'
import LokiStorage from '@lokidb/fs-storage'

const { default: Loki } = LokiDB
const { default: FullTextSearch } = LokiDBSearch
const { FSStorage } = LokiStorage
FullTextSearch.register()
FSStorage.register()

export default async function DB({
  collection = 'stories',
  filename = 'stories/stories.db',
  fullTextSearchFields = ['href', 'content'],
  nestedProperties = []
}) {
  const db = new Loki(filename)
  await db.initializePersistence({ 
    adapter: new FSStorage(),
    autoload: true
  })
  const collections = await db.listCollections()
  const itemsFnd = collections.find(({ name }) => name === collection) 
  let items = itemsFnd
    ? db.getCollection(collection)
    : db.addCollection(collection, {
      fullTextSearch: fullTextSearchFields.map(field => ({ field })),
      nestedProperties
    })

  const svc = {
    find: () => items.chain().find().data(),
    async initFromFS(files, srcDir, storiesDir, lang) {
      db.removeCollection(collection)
      items = db.addCollection(collection, {
        fullTextSearch: fullTextSearchFields.map(field => ({ field })),
        nestedProperties
      })
      // items.clear()
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
      await db.saveDatabase()
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
    },
    // TBD: update content vs update href...
    upsert(file, oldFile, srcDir, storiesDir, lang) {
      // TBD
      items.findAndUpdate({
        href: '/stories/en/Examples/Example2'
      }, (obj) => {
        console.log('found obj...', obj)
        obj.content = 'updated'
        return obj
      })
      const h = items.findOne({ href: '/stories/en/Examples/Example2' })
      console.log('h', h)
      h.content = 'updated again'
      items.update(h)
      console.log('h', items.findOne({ href: '/stories/en/Examples/Example2' }))
    }
  }
  return Object.freeze(svc)
}