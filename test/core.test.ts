import { BackoffPool } from '../src/core'
import { expect } from 'chai'

let loginBackoffPool: BackoffPool

let ip = 'fake-ip'

let defaultInterval = 0
let initialBackoffInterval = 1000
let backoffFactor = 2

beforeEach(() => {
  loginBackoffPool = new BackoffPool({
    defaultInterval,
    initialBackoffInterval,
    backoffFactor,
  })
})

it('should get default interval initially', () => {
  expect(loginBackoffPool.getInterval(ip)).to.equal(defaultInterval)
})

it('should be unlocked by default', () => {
  expect(loginBackoffPool.isLocked(ip)).to.be.false
  expect(loginBackoffPool.isAvailable(ip)).to.be.true
  expect(loginBackoffPool.getUnlockTime(ip)).to.be.undefined
})

it('should get initial backoff interval after first failure', () => {
  loginBackoffPool.fail(ip)
  expect(loginBackoffPool.getInterval(ip)).to.equal(initialBackoffInterval)
  expect(loginBackoffPool.getUnlockTime(ip)).to.equal(
    Date.now() + initialBackoffInterval,
  )
})

it('should apply backoff factor once after two failures', () => {
  loginBackoffPool.fail(ip)
  loginBackoffPool.fail(ip)
  let expectedInterval = initialBackoffInterval * backoffFactor
  expect(loginBackoffPool.getInterval(ip)).to.equal(expectedInterval)
  expect(loginBackoffPool.getUnlockTime(ip)).to.equal(
    Date.now() + expectedInterval,
  )
})

it('should apply backoff factor twice after three failures', () => {
  loginBackoffPool.fail(ip)
  loginBackoffPool.fail(ip)
  loginBackoffPool.fail(ip)
  let expectedInterval = initialBackoffInterval * backoffFactor ** 2
  expect(loginBackoffPool.getInterval(ip)).to.equal(expectedInterval)
  expect(loginBackoffPool.getUnlockTime(ip)).to.equal(
    Date.now() + expectedInterval,
  )
})

it('should reset to default interval after a successful attempt', () => {
  loginBackoffPool.fail(ip)
  expect(loginBackoffPool.getInterval(ip)).to.not.equal(defaultInterval)
  loginBackoffPool.success(ip)
  expect(loginBackoffPool.getInterval(ip)).to.equal(defaultInterval)
  loginBackoffPool.fail(ip)
  expect(loginBackoffPool.getInterval(ip)).to.not.equal(defaultInterval)
  loginBackoffPool.fail(ip)
  expect(loginBackoffPool.getInterval(ip)).to.not.equal(defaultInterval)
  loginBackoffPool.success(ip)
  expect(loginBackoffPool.getInterval(ip)).to.equal(defaultInterval)
  expect(loginBackoffPool.getUnlockTime(ip)).to.be.undefined
})

it('should apply random backoff within range', () => {
  let originInterval = loginBackoffPool.getInterval(ip)
  let range = 1000
  loginBackoffPool.applyRandomBackoff(ip, range)
  let newInterval = loginBackoffPool.getInterval(ip)
  let diff = newInterval - originInterval
  expect(diff).to.below(originInterval + range)
  expect(diff).to.above(originInterval)
  let unlockTime = loginBackoffPool.getUnlockTime(ip)
  expect(unlockTime).to.above(Date.now())
  expect(unlockTime).to.below(Date.now() + range)
})
