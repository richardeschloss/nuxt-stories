export function $nsImport(imports) {
  if (!window.$nsImports) {
    window.$nsImports = {}
  }

  Promise.all(
    Object.entries(imports)
    .reduce((queue, [key, url]) => {
      if (!window.$nsImports[key]) {
        queue.push([key, url])
      }
      return queue
    }, [])
    .map(([key, url]) => import(url)
      .then(c => $nsImports[key] = c.default || c))
  ).then(window.$nsImported)
}
