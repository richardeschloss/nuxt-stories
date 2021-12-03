// @ts-nocheck
import { 
  readFileSync, 
  renameSync, 
  mkdirSync, 
  writeFileSync, 
  rmSync, 
  readdirSync, 
  existsSync, 
  unlinkSync 
} from 'fs'
import { resolve as pResolve, parse as pParse } from 'path'
import { promisify } from 'util'
import chokidar from 'chokidar'
import Glob from 'glob'
import Markdown from './utils/markdown.js'
import { cnt, buildTree, search, parseHref } from './db.client.js'

const glob = promisify(Glob)

function parseFile(file, srcDir) {
  const content = readFileSync(file, { encoding: 'utf-8' })
  const href = file.split(srcDir)[1].replace('.md', '')
  const { lang, labels, parent } = parseHref(href)
  const parsed = Markdown.parse(content)
  if (parsed.frontMatter.order === undefined) {
    parsed.frontMatter.order = Infinity  
  }

  return {
    file,
    lang,
    labels,
    href,
    parent,
    children: [],
    content,
    ...parsed
  }
}

function watcherReady(watcher) {
  return new Promise(resolve => watcher.on('ready', resolve))
}

export default function DB({
  srcDir,
  collection = 'stories',
  filename = `${collection}/${collection}.db`,
  fullTextSearchFields = ['href', 'content'],
  nestedProperties = [],
  autoload = true,
  autosave = false
} = {}) {
  
  const cbs = {}
  let watcher, watching, db, items

  async function fileChanged(evt, file) {
    console.log('fileChanged', evt, file)
    const href = file.split(srcDir)[1].replace('.md', '')
    if (evt === 'add') {
      const parsed = parseFile(file)
      await items.insert(parsed)
    } else if (evt === 'change') {
      const parsed = parseFile(file)
      items.findAndUpdate({ href }, (doc) => {
        doc.content = parsed.content
        return doc
      })
    } else if (evt === 'unlink') {
      const doc = items.findOne({ href })
      items.remove(doc)
    } else {
      console.log('do nothing... evt is', evt)
    }
    if (cbs.fileChanged) {
      const { lang } = parseHref(href)
      const stories = svc.buildTree(lang)
      cbs.fileChanged.forEach((cb) => cb(stories))  
    }
  }
  
  const svc = {
    buildTree: (lang) => buildTree(lang, items),
    cnt: () => cnt(items),
    find: (q) => items.chain().find(q).data(),
    findOne: (q) => items.findOne(q),
    async initFromFS(pattern = pResolve(srcDir, collection, '**/*.md')) {
      const files = await glob(pattern)
      db.removeCollection(collection)
      items = db.addCollection(collection, {
        fullTextSearch: fullTextSearchFields.map(field => ({ field })),
        nestedProperties
      })

      const entries = files.map(f => parseFile(f, srcDir))
      items.insert(entries)
      await db.saveDatabase()
    },
    async load() {
      const LokiDB = await import('@lokidb/loki')
      const LokiDBSearch = await import('@lokidb/full-text-search')
      const LokiStorage = await import('@lokidb/fs-storage/lokidb.fs-storage.js')
      
      /* c8 ignore start */
      // Imports are slightly different in Nuxt env vs. Test env.
      const Loki = LokiDB.Loki || LokiDB.default.Loki
      const FullTextSearch = LokiDBSearch.FullTextSearch || LokiDBSearch.default.FullTextSearch
      const FSStorage = LokiStorage.FSStorage || LokiStorage.default.FSStorage
      /* c8 ignore stop */

      FullTextSearch.register()
      FSStorage.register()
      db = new Loki(filename)
      await db.initializePersistence({ 
        adapter: new FSStorage(),
        autoload,
        autosave
      })
      
      const collections = await db.listCollections()
      const itemsFnd = collections.find(({ name }) => name === collection) 
      items = itemsFnd
        ? db.getCollection(collection)
        : db.addCollection(collection, {
          fullTextSearch: fullTextSearchFields.map(field => ({ field })),
          nestedProperties
        })
    
      if (!itemsFnd) {
        await this.initFromFS()
      }
    },
    async loadStory(href) {
      const fnd = svc.findOne({ href })
      if (!fnd) {
        const newStory = parseHref(href)
        newStory.href = href
        newStory.file = `${pResolve(srcDir, href.slice(1))}.md`
        newStory.content = `---\r\ntitle: ${newStory.name}\r\n---\r\n`
        newStory.children = []
        newStory.order = Infinity
        Object.assign(newStory, { ...Markdown.parse(newStory.content) })
        try {
          const { dir } = pParse(newStory.file)
          if (!existsSync(dir)) {
            mkdirSync(dir) // TBD: uncomment if you dare... { recursive: true }) 
          }
          writeFileSync(newStory.file, newStory.content)
        } catch (err) {
          /* Only support shallow creating of files and directories */
        }
        return items.insert(newStory)
      }
      return fnd
    },
    async watchFS(pattern = pResolve(srcDir, collection)) {
      watcher = chokidar.watch(pattern)
      await watcherReady(watcher)
      watching = true
      watcher.on('all', fileChanged)
    },
    on(label, cb) {
      if (!cbs[label]) {
        cbs[label] = []
      }
      cbs[label].push(cb)
    },
    off(label, cb) {
      if (!Array.isArray(cbs[label])) {
        return
      }
      cbs[label] = cbs[label].filter((fn) => fn.name !== cb.name)
    },
    search: (q) => search(q, items),
    async addStory(href) {
      // TBD: let the watcher handle the db stuff?
      // i.e., just change file tree?
      if (watching) {
        watcher.off('all', fileChanged)
      }
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
      const { labels, lang, parent } = parseHref(newStory.href)
      Object.assign(newStory, { lang, labels, parent, children: [], ...parsed })
      items.insert(newStory)
      writeFileSync(newStory.file, newStory.content)
      await db.saveDatabase()
      if (watching) {
        watcher.on('all', fileChanged)
      }
      return newStory
    },
    async renameStory({ oldHref, newHref }) {
      if (watching) {
        watcher.off('all', fileChanged)
      }
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
      if (watching) {
        watcher.on('all', fileChanged)
      }
    },
    async removeStory(href) {
      if (watching) {
        watcher.off('all', fileChanged)
      }
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
      if (watching) {
        watcher.on('all', fileChanged)
      }
    },
    async updateContent({ href, content }) {
      if (watching) {
        watcher.off('all', fileChanged)
      }
      const file = pResolve(srcDir, href.slice(1)+ '.md') 
      items.findAndUpdate({ href }, (obj) => {
        obj.content = content
        return obj
      })
      await db.saveDatabase()
      writeFileSync(file, content)
      if (watching) {
        watcher.on('all', fileChanged)
      }
    }
  }
  
  return Object.freeze(svc)
}