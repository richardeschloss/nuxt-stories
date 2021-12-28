import { spawn } from 'child_process'
import reporter from 'tap-json'

export function runTest ({ file, testCmd = 'ava', coverage = false }) {
  const args = []
  if (coverage) {
    args.push('c8')
  }

  args.push(testCmd, file, '--tap')

  return new Promise((resolve) => {
    const childProcess = spawn('npx', args,
      {
        // Run child_process in testing environment
        env: {
          ...process.env,
          NODE_ENV: 'testing'
        }
      }
    )
    childProcess.stdout
      .pipe(reporter())
      .on('data', resolve)
  })
}
