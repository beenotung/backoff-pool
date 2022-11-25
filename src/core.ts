export interface BackoffPoolOptions {
  defaultInterval?: number // default 0
  initialBackoffInterval?: number // default 1 second
  backoffFactor?: number // default 2
  randomBackoffRatio?: number // default 0.2 (20%)
}
export class BackoffPool<Key = string | number> {
  private intervals: Map<Key, number> = new Map()

  private defaultInterval: number
  private initialBackoffInterval: number
  private backoffFactor: number
  private randomBackoffRatio: number

  public constructor(options: BackoffPoolOptions = {}) {
    this.defaultInterval = options.defaultInterval || 0
    this.initialBackoffInterval = options.initialBackoffInterval || 1000
    this.backoffFactor = options.backoffFactor || 2
    this.randomBackoffRatio = options.randomBackoffRatio || 0.2
  }

  success(key: Key): void {
    this.intervals.delete(key)
  }

  fail(key: Key): void {
    let interval = this.getInterval(key)
    interval = interval
      ? interval * this.backoffFactor
      : this.initialBackoffInterval
    this.intervals.set(key, interval)
  }

  getInterval(key: Key): number {
    return this.intervals.get(key) || this.defaultInterval
  }

  applyRandomBackoff(key: Key, range?: number): void {
    let interval = this.getInterval(key)
    interval += Math.random() * (range || this.randomBackoffRatio * interval)
    this.intervals.set(key, interval)
  }
}
