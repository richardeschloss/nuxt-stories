// @ts-nocheck
import { readFileSync } from 'fs'
import { promisify } from 'util'
import Glob from 'glob'
import LokiDB from '@lokidb/loki' // TBD: re-test...
import LokiDBSearch from '@lokidb/full-text-search'
import * as LokiStorage from '@lokidb/fs-storage/lokidb.fs-storage.js'
import Markdown from './utils/markdown.client.js'

const glob = promisify(Glob)

/* c8 ignore start */
// Imports are slightly different in Nuxt env vs. Test env.
const Loki = LokiDB.default || LokiDB
const FullTextSearch = LokiDBSearch.FullTextSearch || LokiDBSearch
const FSStorage = LokiStorage.FSStorage || LokiStorage.default.FSStorage
/* c8 ignore stop */

FullTextSearch.register()
FSStorage.register()

export default async function DB({
  srcDir,
  collection = 'stories',
  filename = 'stories/stories.db',
  fullTextSearchFields = ['href', 'content'],
  nestedProperties = [],
  autoload = true,
  autosave = true
} = {}) {
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
    buildTree(lang = 'en') {
      const stories = []
      svc.find({ lang }).forEach(({ labels, href, parent, frontMatter }) => {
        const story = {
          name: labels.at(-1), 
          href, 
          parent,
          order: frontMatter.order, 
          children: [] 
        }
        let useArr = stories
        if (story.parent === null) {
          useArr.push(story)
        } else {
          // find parent
          const pathParts = story.parent.split('/')
          let fnd
          for (let idx = 4; idx <= pathParts.length; idx++) {
            const lookup = pathParts.slice(0, idx).join('/')
            fnd = useArr.find((i) => i.href === lookup)
            if (fnd && idx === pathParts.length) {
              fnd.children.push(story)
            } 
            useArr = fnd.children
          }
        } 
      })
      return stories
    },
    cnt: () => items.count(),
    find: (q) => items.chain().find(q).data(),
    findOne: (q) => items.findOne(q),
    async initFromFS(pattern) {
      const files = await glob(pattern)
      db.removeCollection(collection)
      items = db.addCollection(collection, {
        fullTextSearch: fullTextSearchFields.map(field => ({ field })),
        nestedProperties
      })

      // let startIdx = 0 // TBD
      const entries = files.map((file) => {
        const relPath = file.split(srcDir)[1].replace('.md', '')
        const parts = relPath.split('/')
        const lang = parts[2]
        const labels = parts.slice(3)
        const content = readFileSync(file, { encoding: 'utf-8' })
        const parsed = Markdown.parse(content)
        if (parsed.frontMatter.order === undefined) {
          parsed.frontMatter.order = Infinity  
        }

        return {
          file,
          lang,
          labels,
          href: relPath,
          parent: labels.length > 1
            ? relPath.split('/' + labels.at(-1))[0]
            : null,
          children: [],
          content,
          ...parsed
        }
      })
      items.insert(entries)
      await db.saveDatabase()
    },
    async search(q, lang = 'en') {
      return await items
        .chain()
        .find({
          lang, 
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