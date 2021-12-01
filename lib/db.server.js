// @ts-nocheck
import { 
  readFileSync, 
  renameSync, 
  mkdirSync, 
  opendirSync, 
  writeFileSync, 
  rmSync, 
  readdirSync, 
  existsSync, 
  unlinkSync 
} from 'fs'
import { resolve as pResolve, parse as pParse } from 'path'
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

async function dirEmpty(dir) {
  const dirIter = opendirSync(dir)
  const { done } = await dirIter[Symbol.asyncIterator]().next()
  return done
}

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
    async addStory(href) {
      const newStory = {}
      newStory.dir = pResolve(srcDir, href.slice(1))
      if (!existsSync(newStory.dir)) {
        mkdirSync(newStory.dir, { recursive: true })  
      }
      const newStoryCnt = readdirSync(newStory.dir)
        .filter(f => f.match(/NewStory.+\.md/))
        .length    
      
      newStory.name =`NewStory${newStoryCnt}`
      newStory.href = `${href}/${newStory.name}`
      newStory.file = `${pResolve(srcDir, newStory.href.slice(1))}.md`
      newStory.content = `---\r\ntitle: ${newStory.name}\r\norder: ${newStoryCnt}\r\n---\r\n`
      const parts = newStory.href.split('/')
      const lang = parts[2]
      const labels = parts.slice(3) 
      const parsed = Markdown.parse(newStory.content)
      const parent = labels.length > 1
        ? newStory.href.split('/' + labels.at(-1))[0]
        : null
      Object.assign(newStory, { lang, labels, parent, children: [], ...parsed })
      items.insert(newStory)
      writeFileSync(newStory.file, newStory.content)
      await db.saveDatabase()
    },
    async renameStory({ oldHref, newHref }) {
      const oldStory = {
        href: oldHref,
        childDir: pResolve(srcDir, oldHref.slice(1))
      }
      oldStory.file = oldStory.childDir + '.md' 
      oldStory.parsed = pParse(oldStory.file)

      const newStory = {
        href: newHref,
        childDir: pResolve(srcDir, newHref.slice(1))
      }
      newStory.file = pResolve(srcDir, newHref.slice(1) + '.md')
      newStory.parsed = pParse(newStory.file)

      items.findAndUpdate({ href: oldHref }, (obj) => {
        obj.href = newStory.href
        return obj
      })

      items.findAndUpdate({ 
        href: { $contains: oldHref + '/' }
      }, (obj) => {
        obj.href = obj.href.replace(oldStory.href, newStory.href)
        return obj
      })
      renameSync(oldStory.file, newStory.file)
      if (existsSync(oldStory.childDir)) {
        renameSync(oldStory.childDir, newStory.childDir)  
      }
      await db.saveDatabase()
    },
    async removeStory(href) {
      const childDir = pResolve(srcDir, href.slice(1))
      const file = childDir + '.md'
      const fnd = items.find({ href })
      const children = items.find({ href: { $contains: href + '/' }})
      items.remove(fnd)
      items.remove(children)
      unlinkSync(file) 
      if (existsSync(childDir)) {
        rmSync(childDir, { recursive: true })
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