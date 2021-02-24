import { serial as test, before, after } from 'ava'
import { existsSync, unlinkSync } from 'fs'
import { resolve as pResolve } from 'path'
import express from 'express'
import { fetchComponents } from '@/lib/utils/autoImport.server'

let _server

before('Start Server', () => {
  return new Promise((resolve) => {
    const app = express()
    app.use(express.static('static'))
    _server = app.listen(3002, 'localhost', resolve)
  })
})

after(() => _server.close())

test('Import server-side', async (t) => {
  const components = [
    [ 'E', '/Example1.js' ],
    [ 'E2', '/Example2.mjs' ],
    [ 'E2b', 'http://localhost:3002/Example2.mjs' ],
    [ 'Example3', '/Example3.vue' ]
  ]

  components.forEach((c) => {
    const ext = c[1].split('.')[1]
    const f = pResolve(`./components/nuxtStories/${c[0]}.${ext}`)
    if (existsSync(f)) {
      unlinkSync(f)
    }
  })

  await fetchComponents({
    components,
    origin: 'https://localhost:3003'  
  }).catch(() => {})
  
  await fetchComponents({
    components,
    origin: 'http://localhost:3002'  
  })
  components.forEach((c) => {
    const ext = c[1].split('.')[1]
    const f = pResolve(`./components/nuxtStories/${c[0]}.${ext}`)
    t.true(existsSync(f))
  })

  await fetchComponents({
    components,
    origin: 'http://localhost:3002'  
  })
})
