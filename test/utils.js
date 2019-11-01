/* eslint-disable no-console */
import { Nuxt, Builder } from 'nuxt'
import config from '@/nuxt.config'

const oneSecond = 1000
const oneMinute = 60 * oneSecond

export async function nuxtInit(t) {
  t.timeout(3 * oneMinute)
  console.time('nuxtInit')
  console.log('Building Nuxt with config', config)
  const nuxt = new Nuxt(config)
  await new Builder(nuxt).build()
  await nuxt.server.listen(3000, 'localhost')
  t.context.nuxt = nuxt
  console.timeEnd('nuxtInit')
}

export function nuxtClose(t) {
  const { nuxt } = t.context
  nuxt.close()
}

export function getModuleOptions(moduleName) {
  const opts = {}
  const containers = ['buildModules', 'modules']
  containers.some((container) => {
    const arr = config[container]
    const mod = arr.find((item) => {
      if (typeof item === 'string') {
        return item === moduleName
      } else if (item.length) {
        return item[0] === moduleName
      }
    })
    if (mod) {
      if (mod.length) {
        Object.assign(opts, mod[1])
      }
      return true
    }
  })
  return opts
}
