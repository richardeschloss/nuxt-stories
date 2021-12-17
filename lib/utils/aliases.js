export const testImports = { // TBD: auto-generate?
  '/e2e/tmp.js': async () => (await import('@/test/e2e/tmp.js')).default,
  '/e2e/Readme.js': async () => (await import('@/test/e2e/Readme.js')).default
}