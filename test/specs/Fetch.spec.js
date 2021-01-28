import { serial as test, before, after } from 'ava'
import express from 'express'
import FetchSvc from '@/lib/utils/fetch'

let _server

before(() => {
  return new Promise((resolve) => {
    const app = express()
    app.get('/hi', (req, res) => res.json(req.query))
    _server = app.listen(3002, 'localhost', resolve)
  })
})

after(() => _server.close())

test('Fetch (client-side)', async (t) => {
  process.client = true
  const urlResp = {
    '/someCsv': 'hdr1,hdr2\r\ndata1,data2',
    '/someXML': '<xml>Some XML resp</xml>'
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
    $store: {
      state: {
        fetched: {
          '/some/story': {}
        }
      },
      commit (mutation, { path, key, resp }) {
        t.is(mutation, '$nuxtStories/SET_FETCHED')
        t.is(path, ctx.$route.path)
        ctx.$store.state.fetched[ctx.$route.path][key] = resp
        ctx.fetched[key] = resp
      }
    }
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
      someXML: '/someXML | xml',
      cacheLocal: '/someData | json > localStorage',
      cacheSession: '/someData | json > sessionStorage',
      nullEntry: null
    }
  }

  await FetchSvc.fetch({
    fetchInfo: frontMatter.fetch,
    fetchOpts: {
      myUrl: { headers: { accept: 'abc123' } },
      myUrl2: ':myUrl2Opts',
      myUrl3: 'malformedStr'
    },
    ctx,
    notify (key, resp) {
      console.log(key, resp)
    }
  })
  t.is(_opts.length, 2)
  t.is(_opts[0].headers.accept, 'abc123')
  t.is(_opts[1].accept, '123')
  t.is(ctx.fetched.myUrl, '/someUrl: some text resp')
  t.is(ctx.fetched.wParam, '/someUrl/231/GreatBook: some text resp')
  t.is(ctx.fetched.wEnvVar, '/someApi/?key=openSesame123: some text resp')
  t.is(ctx.fetched.someJson['/someJson'], 'some json resp')
  t.is(ctx.fetched.someCsv[0].hdr1, 'data1')
  t.is(ctx.fetched.someCsv[0].hdr2, 'data2')
  t.is(ctx.fetched.someXML.xml, 'Some XML resp')
  const localFetched = JSON.stringify(ctx.fetched)
  const vuexFetched = JSON.stringify(ctx.$store.state.fetched[ctx.$route.path])
  t.is(localFetched, vuexFetched)
})

test('Fetch (server-side, origin undef)', async (t) => {
  process.client = false
  const ctx = {
    fetched: {}
  }
  const frontMatter = {
    fetch: {
      myUrl: '/someUrl'
    }
  }
  const headers = {
    accept: 'abc123'
  }
  await FetchSvc.fetch({
    fetchInfo: frontMatter.fetch,
    ctx,
    notify ({ key, resp }) {
      t.is(key, 'myUrl')
      t.is(resp, 'Only absolute URLs are supported')
    }
  })
})

test('Fetch (server-side, origin defined)', async (t) => {
  const ctx = {}
  const frontMatter = {
    fetch: {
      hi: '/hi?msg=world | json'
    }
  }
  await FetchSvc.fetch({
    fetchInfo: frontMatter.fetch,
    origin: 'http://localhost:3002',
    ctx,
    notify ({ key, resp }) {
      t.is(key, 'hi')
      t.is(resp.msg, 'world')
    }
  })
  t.pass()
})
