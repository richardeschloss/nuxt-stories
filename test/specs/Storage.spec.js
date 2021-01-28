import { serial as test } from 'ava'
import { storeData } from '@/lib/utils/storage'

test('Storage', (t) => {
  const _localSet = []; const _sessionSet = []
  global.window = {
    localStorage: {
      setItem (key, val) {
        _localSet.push({ key, val })
      }
    },
    sessionStorage: {
      fetched: '{"en/somePath": {}}',
      setItem (key, val) {
        _sessionSet.push({ key, val })
      }
    }
  }
  storeData('undef', {})
  t.is(_localSet.length, 0)
  t.is(_sessionSet.length, 0)
  storeData('lS', { item: 'fetched' })
  storeData('lS', {
    item: 'fetched',
    path: 'stories/en/someStory',
    data: 123
  })
  storeData('lS', {
    item: 'fetched',
    path: 'stories/en/someStory',
    key: 'myData',
    data: 123
  })
  storeData('sS', {
    item: 'fetched',
    path: 'en/somePath',
    key: 'myData',
    data: 321
  })
  t.is(_localSet[0].key, 'fetched')
  t.is(_localSet[0].val, '{}')
  t.is(_localSet[1].key, 'fetched')
  t.is(_localSet[1].val, '{"stories/en/someStory":123}')
  t.is(_localSet[2].key, 'fetched')
  t.is(_localSet[2].val, '{"stories/en/someStory":{"myData":123}}')

  t.is(_sessionSet[0].key, 'fetched')
  t.is(_sessionSet[0].val, '{"en/somePath":{"myData":321}}')
})
