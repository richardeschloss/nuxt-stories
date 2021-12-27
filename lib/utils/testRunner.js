import { spawn } from 'child_process'
import reporter from 'tap-json'

export function runTest (file) {
  return new Promise((resolve) => {
    const ava = spawn(
      'npx',
      [
        // TBD: kinda working, but not quite
        // Coverage:
        // 'c8',

        // Run test
        'ava', file, '--tap'
      ],
      {
        // Run child_process in testing environment
        env: {
          ...process.env,
          NODE_ENV: 'testing'
        }
      }
    )
    ava.stdout
      .pipe(reporter())
      .on('data', resolve)
  })
}
