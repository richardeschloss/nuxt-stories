async function runSerial (ctx, tests = [], beforeEach, afterEach) {
  const results = []
  const entries = Object.entries(tests)
  for (let i = 0; i < entries.length; i++) {
    if (beforeEach) {
      beforeEach(ctx)
    }
    const [test, fn] = entries[i]
    const resp = await fn(ctx)
    results.push({ test, status: resp ? 'PASS' : 'FAIL' })
    if (afterEach) {
      afterEach(ctx)
    }
  }
  return results
}

async function runTestCases (ctx, tests = [], beforeEach, afterEach) {
  const p = Object.entries(tests).map(async ([test, fn]) => {
    if (beforeEach) {
      beforeEach(ctx)
    }
    const resp = await fn(ctx)
    if (afterEach) {
      afterEach(ctx)
    }
    return resp
  })
  const results = await Promise.all(p)
  return results
}

async function runTests (file) {
  const imported = await import(file)
  const {
    before,
    beforeEach,
    tests,
    serial,
    afterEach,
    after
  } = imported
  if (!tests && !serial) {
    // eslint-disable-next-line no-console
    console.error('No tests exist in', file)
    return
  }
  const ctx = {}
  if (before) {
    before(ctx)
  }
  const results = []

  if (tests) {
    results.push(...await runTestCases(ctx, tests, beforeEach, afterEach))
  }

  if (serial) {
    results.push(...await runSerial(ctx, serial, beforeEach, afterEach))
  }

  if (after) {
    after(ctx)
  }
  console.log(file, results)
  return results
}

export async function runSuite (cfg) {
  const { files } = cfg
  const p = files.map(async file => ({
    file,
    results: await runTests(file)
  }))
  const results = await Promise.all(p)
  return results
}

runSuite({
  files: [
    './specs/Module.js'
  ]
})
