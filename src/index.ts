import * as core from '@actions/core'
import { run } from './main'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
;(async () => {
  try {
    await run()
  } catch (err) {
    handleError(err)
  }
})()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleError(err: any): void {
  console.error(err)
  core.setFailed(`Unhandled error: ${err}`)
}
