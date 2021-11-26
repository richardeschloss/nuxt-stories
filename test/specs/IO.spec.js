import { resolve } from 'path'
import ava from 'ava'
import { wrapPlugin } from '../utils/plugin.js'
import Plugin from 'nuxt-socket-io/lib/plugin.js'
import { register } from '#root/lib/module.js'

global.__dirname = 'lib'

const srcDir = resolve('.')
const { before, serial: test } = ava
const ctx = {
  options: {
    server: {
      host: 'localhost',
      port: 3000  
    }
  }
}

before(async () => {
  await register.io(ctx)
  register.options({ srcDir })
})


test('Fetch Stories', async (t) => {
  const client = wrapPlugin(Plugin)
  client.$config = {
    io: ctx.options.io,
    nuxtSocketIO: {}
  }
  client.Plugin(null, client.inject)
  const s = client.$nuxtSocket({ 
    channel: '/',
    namespaceCfg: {
      emitters: ['fetchStories']
    } 
  })
  const { stories } = await client.fetchStories({
    lang: 'en',
    storiesDir: 'stories'
  })
  t.true(stories.length > 0)
 })