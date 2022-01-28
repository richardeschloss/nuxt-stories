import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { register, db } from './module.js'

const srcDir = resolve('.')
// @ts-ignore
global.__dirname = dirname(fileURLToPath(import.meta.url))

async function start () {
  await register.db({ srcDir })
  await db.watchFS()
  await register.ioServer(null, {
    host: 'localhost',
    port: 3100,
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })
}

start()
