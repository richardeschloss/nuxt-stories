// @ts-nocheck
export function parseHref(href) {
  const parts = href.split('/')
  const lang = parts[2]
  const labels = parts.slice(3)
  const name = parts.at(-1)
  const parent = labels.length > 1
    ? parts.slice(0, parts.length - 1).join('/')
    : null
  return { lang, labels, parent, name }
}

export const cnt = (items) => items.count()

export function buildTree(lang = 'en', items) {
  const stories = []
  let depth = 0
  const entries = items.chain().find({ lang }).data()
  entries.forEach(({ labels, href, parent, frontMatter }) => {
    if (labels.length > depth) {
      depth = labels.length
    }
    // Only build tree with as minimal info it needs
    // Only when an individual story is loaded will 
    // care about all of its content, toc and frontMatter.
    const story = {
      name: labels.at(-1), 
      href, 
      parent,
      order: frontMatter.order,
      children: [],
      labels 
    }
    let useArr = stories
    if (story.parent === null) {
      useArr.push(story)
    } else {
      // find parent (first)
      // href split ==> [ '', collection = 'stories', lang = 'en', ...labels ]
      const pathParts = story.parent.split('/')
      const startIdx = 4
      let fnd
      for (let idx = startIdx; idx <= pathParts.length; idx++) {
        const lookup = pathParts.slice(0, idx).join('/')
        
        // First look in level0, then deeper levels
        // if not found
        // TBD: might be finding too early if child name matches
        // parent
        fnd = useArr.find((i) => i.href === lookup)
        if (!fnd) {
          const { name, parent: parentHref } = parseHref(lookup)
          fnd = {
            name,
            href: lookup,
            parent: parentHref,
            order: useArr.length,
            children: []
          }
          useArr.push(fnd)
        }

        // Drilldown to the next level
        useArr = fnd.children
        if (idx === pathParts.length) {
          // If we reached the deepest level, add the node here
          fnd.children.push(story)
        }
      }
    } 
  })
  stories.depth = depth
  return stories
}

export async function search(q, items) {
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

export function getLangs(items) {
  return items.chain().find({})
    .mapReduce(
      ({ lang }) => lang, 
      (langs) =>Array.from(new Set(langs))
    )
}

// The db was created by db.server
// (and that set the fullTextSearchFields)
// The db.client treats that db as read-only
export default function DB({
  collection = 'stories',
  filename = `/nuxtStories/${collection}.db`
} = {}) {
  let db, items
   
  const svc = {
    getLangs: () => getLangs(items),
    buildTree: (lang) => buildTree(lang, items),
    cnt: () => cnt(items),
    async initItems() {
      const json = await fetch(filename)
        .then(res => res.json())
      
      db.loadJSONObject(json)
      items = db.getCollection(collection)
      return items.count()
    },
    async load() {
      const LokiDB = await import('@lokidb/loki')
      const LokiDBSearch = await import('@lokidb/full-text-search')

      /* c8 ignore start */
      const Loki = LokiDB.Loki || LokiDB.default.Loki
      const FullTextSearch = LokiDBSearch.FullTextSearch || LokiDBSearch.default.FullTextSearch
      FullTextSearch.register()
      /* c8 ignore stop */
      db = new Loki(filename)

      return this.initItems()
    },
    search: (q) => search(q, items)
  }
  return svc
}