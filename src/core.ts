export interface BackoffPoolOptions {
  defaultInterval?: number // default 0
  initialBackoffInterval?: number // default 1 second
  maxBackoffInterval?: number // default unlimited
  backoffFactor?: number // default 2
  randomBackoffRatio?: number // default 0.2 (20%)
}

export let defaultBackoffPoolOptions: Required<BackoffPoolOptions> = {
  defaultInterval: 0,
  initialBackoffInterval: 1000,
  maxBackoffInterval: Number.POSITIVE_INFINITY,
  backoffFactor: 2,
  randomBackoffRatio: 0.2,
}
export class BackoffPool<Key = string | number> {
  private intervals = new Map<Key, number>()
  private unlockTimes = new Map<Key, number>()

  private options: Required<BackoffPoolOptions>

  constructor(options: BackoffPoolOptions = {}) {
    this.options = {
      ...defaultBackoffPoolOptions,
      ...options,
    }
  }

  success(key: Key): void {
    this.intervals.delete(key)
    this.unlockTimes.delete(key)
  }

  fail(key: Key): void {
    let interval = this.getInterval(key)
    interval = interval
      ? interval * this.options.backoffFactor
      : this.options.initialBackoffInterval
    this.setInterval(key, interval)
  }

  private setInterval(key: Key, interval: number): void {
    let max = this.options.maxBackoffInterval
    if (interval > max) {
      interval = max
    }
    this.intervals.set(key, interval)
    this.unlockTimes.set(key, Date.now() + interval)
  }

  getInterval(key: Key): number {
    return this.intervals.get(key) || this.options.defaultInterval
  }

  applyRandomBackoff(key: Key, range?: number): void {
    let interval = this.getInterval(key)
    interval +=
      Math.random() * (range || this.options.randomBackoffRatio * interval)
    this.setInterval(key, interval)
  }

  isLocked(key: Key): boolean {
    return !this.isAvailable(key)
  }

  isAvailable(key: Key): boolean {
    let unlockTime = this.unlockTimes.get(key)
    return !unlockTime || Date.now() >= unlockTime
  }
}
