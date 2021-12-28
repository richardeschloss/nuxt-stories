function windowStore ({ store, item, path, key, data }) {
  const stored = JSON.parse(window[store][item] || '{}')
  if (!stored[path]) {
    stored[path] = {}
  }

  if (key) {
    stored[path][key] = data
  } else {
    stored[path] = data
  }
  window[store].setItem(item, JSON.stringify(stored))
}

const stores = {
  localStorage (info) {
    windowStore({ store: 'localStorage', ...info })
  },
  sessionStorage (info) {
    windowStore({ store: 'sessionStorage', ...info })
  }
}
stores.lS = stores.localStorage
stores.sS = stores.sessionStorage

/**
 *
 * @param {string} dest - storage name or alias
 * @param {object} info
 * @param {string} info.item
 * @param {string} info.path
 * @param {string} [info.key]
 * @param {string} info.data
 *
 * Ex: For a given route path, we might store the data in:
 * localStorage['fetched'][$route.path]['someData'] = info.data
 */
export function storeData (dest, info) {
  // Other dests: (localStorage, sessionStorage, etc.)
  // Perhaps support indexedDB (idb), webSQL and cookies someday?
  // Keep it simple for now...
  if (stores[dest]) {
    stores[dest](info)
  }
}

export function getData (dest, info) {
  const stored = window[dest].getItem(info.item)
  if (stored) {
    const json = JSON.parse(stored)
    return json[info.path]
  }
}
