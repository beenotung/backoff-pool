import { BackoffPool } from '../src/core'

async function main() {
  let backoffPool = new BackoffPool({
    defaultInterval: 0,
    initialBackoffInterval: 2000,
    backoffFactor: 2,
  })

  let clientIP = 'stub'

  console.log('0', backoffPool.isAvailable(clientIP)) // true: is available
  console.log('0', backoffPool.isLocked(clientIP)) // false: not locked
  console.log('0', backoffPool.getUnlockTime(clientIP)) // undefined: not locked

  backoffPool.fail(clientIP) // lock for 2 seconds
  console.log('1', backoffPool.isAvailable(clientIP)) // false: not available
  console.log('1', backoffPool.getUnlockTime(clientIP)) // Date.now() + 2000

  backoffPool.fail(clientIP) // failed again, lock for 4 seconds
  backoffPool.fail(clientIP) // failed again, lock for 8 seconds
  console.log('2', backoffPool.getInterval(clientIP)) // 8000: 8 seconds

  await sleep(7 * 1000)
  console.log('7', backoffPool.isAvailable(clientIP)) // false: still locked

  await sleep(1 * 1000)
  console.log('8', backoffPool.isAvailable(clientIP)) // true: unlocked now

  backoffPool.success(clientIP) // reset the interval
  console.log('9', backoffPool.getInterval(clientIP)) // 0: same as defaultInterval

  backoffPool.fail(clientIP) // lock for 2 seconds instead of 16 seconds

  await sleep(2 * 1000)
  console.log('10', backoffPool.isLocked(clientIP)) // false: unlocked now
}
main().catch(e => console.error(e))

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
