import { spawn } from 'child_process'
import reporter from 'tap-json'

export function runTest (file) {
  return new Promise((resolve) => {
    const ava = spawn('npx', ['ava', file, '--tap', '--verbose'])
    ava.stdout
      .pipe(reporter())
      .on('data', resolve)
  })
}
