import { serial as test, before, after } from 'ava'
import express from 'express'
import { fetchComponents } from '@/lib/utils/autoImport.server'

let _server

before('Start Server', () => {
  return new Promise((resolve) => {
    const app = express()
    app.use(express.static('static')) // 'test/static'))
    app.get('/someJson', (req, res) => {
      res.json({
        abc: 123
      })
    })
    app.get('/hi', (req, res) => res.json(req.query))
    _server = app.listen(3002, 'localhost', resolve)
  })
})

after(() => _server.close())

test('Import server-side', async (t) => {
  const components = {
    E: '/Example1.js',
    E2: '/Example2.js'
  }
  await fetchComponents({
    components,
    origin: 'http://localhost:3002'  
  })
  console.log('all done?')
  t.pass()
})
