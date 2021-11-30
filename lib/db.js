// @ts-nocheck
import { readFileSync } from 'fs'
import LokiDB from '@lokidb/loki' // TBD: re-test...
import LokiDBSearch from '@lokidb/full-text-search'
import * as LokiStorage from '@lokidb/fs-storage/lokidb.fs-storage.js'

/* c8 ignore start */
// Imports are slightly different in Nuxt env vs. Test env.
const Loki = LokiDB.default || LokiDB
const FullTextSearch = LokiDBSearch.FullTextSearch || LokiDBSearch
const FSStorage = LokiStorage.FSStorage || LokiStorage.default.FSStorage
/* c8 ignore stop */

FullTextSearch.register()
FSStorage.register()

export default async function DB({
  collection = 'stories',
  filename = 'stories/stories.db',
  fullTextSearchFields = ['href', 'content'],
  nestedProperties = [],
  autoload = true,
  autosave = true
}) {
  const db = new Loki(filename)
  await db.initializePersistence({ 
    adapter: new FSStorage(),
    autoload,
    autosave
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
    cnt: () => items.count(),
    find: () => items.chain().find().data(),
    findOne: (q) => items.findOne(q),
    async initFromFS(files, srcDir, storiesDir, lang) {
      db.removeCollection(collection)
      items = db.addCollection(collection, {
        fullTextSearch: fullTextSearchFields.map(field => ({ field })),
        nestedProperties
      })
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
    },
    async addStory({ href, content, storiesDir, lang }) {
      const labels = href.split(`/${storiesDir}/${lang}/`)[1]
        .split('/')
      const fnd = items.findOne({ href })
      if (fnd) {
        Object.assign(fnd, { href, content, labels })
        items.update(fnd)
      } else {
        items.insert({ labels, href, content })
      }
      await db.saveDatabase()
    },
    async renameStory({ oldHref, href }) {
      items.findAndUpdate({ href: oldHref }, (obj) => {
        obj.href = href
        return obj
      })
      await db.saveDatabase()
    },
    async removeStory({ href }) {
      const fnd = items.findOne({ href })
      if (fnd) {
        items.remove(fnd)
      }
      await db.saveDatabase()
    },
    async updateContent({ href, content }) {
      items.findAndUpdate({ href }, (obj) => {
        obj.content = content
        return obj
      })
      await db.saveDatabase()
    }
  }
  return Object.freeze(svc)
}