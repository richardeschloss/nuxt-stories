import http from 'http'
import ava from 'ava'
import Fetch from '#root/lib/utils/fetch.js'
import { useState } from '#app'

const { serial: test, before, after } = ava

let _server
let NodeFetch

before(() => {
  _server = http.createServer()
  _server.on('request', (req, res) => {
    if (req.url.endsWith('.xml')) {
      res.end('<xml>Some XML here</xml>')
      return
    }
    const { searchParams } = new URL(`http://localhost:3002${req.url}`)
    const out = {}
    for (const [key, val] of searchParams.entries()) {
      out[key] = val
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(out))
  })
  _server.listen(3002)
})

after(() => _server.close())

test('Fetch (client-side)', async (t) => {
  process.client = true
  const urlResp = {
    '/someCsv': 'hdr1,hdr2\r\ndata1,data2'
  }
  const _opts = []
  // eslint-disable-next-line require-await
  global.fetch = async (url, opts) => {
    if (opts) {
      _opts.push(opts)
    }
    return {
      // eslint-disable-next-line require-await
      async text () {
        return urlResp[url] || `${url}: some text resp`
      },
      // eslint-disable-next-line require-await
      async json () {
        return { [url]: 'some json resp' }
      }
    }
  }
  global.window = {
    localStorage: {
      setItem (item) {
        t.is(item, 'fetched')
      }
    },
    sessionStorage: {
      setItem (item) {
        t.is(item, 'fetched')
      }
    }
  }
  const ctx = {
    id: 231,
    book: 'GreatBook',
    fetched: {},
    myUrl2Opts: {
      accept: '123'
    },
    $set (obj, key, val) {
      obj[key] = val
    },
    $route: {
      path: '/some/story'
    },
    $nuxtStories: () => useState('$nuxtStories', () => ({
      fetched: {}
    }))
  }
  process.env.API_KEY = 'openSesame123'
  const frontMatter = {
    fetch: {
      myUrl: '/someUrl',
      myUrl2: '/someUrl2',
      myUrl3: '/someUrl3',
      wParam: '/someUrl/:id/:book',
      wEnvVar: '/someApi/?key=$API_KEY',
      someJson: '/someJson | json',
      someCsv: '/someCsv| csv',
      // someXML: '/someXML | xml',
      cacheLocal: '/someData | json > localStorage',
      cacheSession: '/someData | json > sessionStorage',
      nullEntry: null
    }
  }

  const fetched = await Fetch({
    fetchInfo: frontMatter.fetch,
    fetchOpts: {
      myUrl: { headers: { accept: 'abc123' } },
      myUrl2: ':myUrl2Opts',
      myUrl3: 'malformedStr'
    },
    ctx,
    notify (key, resp) {
      // console.log(key, resp)
    }
  })
  const state = ctx.$nuxtStories().value
  t.is(_opts.length, 2)
  t.is(_opts[0].headers.accept, 'abc123')
  t.is(_opts[1].accept, '123')
  t.is(fetched.myUrl, '/someUrl: some text resp')
  t.is(fetched.wParam, '/someUrl/231/GreatBook: some text resp')
  t.is(fetched.wEnvVar, '/someApi/?key=openSesame123: some text resp')
  t.is(fetched.someJson['/someJson'], 'some json resp')
  t.is(fetched.someCsv[0].hdr1, 'data1')
  t.is(fetched.someCsv[0].hdr2, 'data2')
  const localFetched = JSON.stringify(fetched)
  const globalFetched = JSON.stringify(state.fetched[ctx.$route.path])
  t.is(localFetched, globalFetched)

  // Attempt to change activeStory frontMatter
  state.activeStory = {
    frontMatter: {
      fetch: {
        myUrl: '/someUrl'
      }
    }
  }
  await Fetch({
    fetchInfo: frontMatter.fetch,
    ctx
  })
  t.is(state.fetched[ctx.$route.path].myUrl, '/someUrl: some text resp')
  t.falsy(state.fetched[ctx.$route.path].wParam)
})

test('Fetch (server-side, origin undef)', async (t) => {
  NodeFetch = (await import('#root/lib/utils/fetch.server.js')).default // redefines global.fetch
  process.client = false
  const ctx = {
    fetched: {},
    $nuxtStories: () => useState('$nuxtStories', () => ({
      fetched: {}
    }))
  }
  const frontMatter = {
    fetch: {
      myUrl: '/someUrl'
    }
  }
  await NodeFetch({
    fetchInfo: frontMatter.fetch,
    ctx,
    notify ({ key, resp }) {
      t.is(key, 'myUrl')
      t.is(resp, 'Invalid URL')
    }
  })
})

test('Fetch (server-side, origin defined)', async (t) => {
  process.client = false
  NodeFetch = (await import('#root/lib/utils/fetch.server.js')).default // redefines global.fetch
  const ctx = {
    fetched: {},
    $route: {
      path: '/some/story'
    },
    $nuxtStories: () => useState('$nuxtStories', () => ({
      fetched: {}
    }))
  }
  const frontMatter = {
    fetch: {
      hi: '/hi?msg=world | json',
      myXml: '/some.xml | xml'
    }
  }
  const resp = await NodeFetch({
    fetchInfo: frontMatter.fetch,
    origin: 'http://localhost:3002',
    ctx,
    notify ({ key, resp }) {}
  })
  t.is(resp.hi.msg, 'world')
  t.is(resp.myXml.xml, 'Some XML here')
})
