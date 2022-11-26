# backoff-pool

A helper library to manage expotential backoff intervals of different resources.

This can be used to manage retry interval of login attempts per IP address.

[![npm Package Version](https://img.shields.io/npm/v/backoff-pool)](https://www.npmjs.com/package/backoff-pool)
[![Minified Package Size](https://img.shields.io/bundlephobia/min/backoff-pool)](https://bundlephobia.com/package/backoff-pool)
[![Minified and Gzipped Package Size](https://img.shields.io/bundlephobia/minzip/backoff-pool)](https://bundlephobia.com/package/backoff-pool)

## Installation

```bash
npm install backoff-pool
```

## Importing this package

import from typescript:

```typescript
import { BackoffPool } from 'backoff-pool'
```

Or import from javascript:

```javascript
const { BackoffPool } = require('backoff-pool')
```

## Typescript Types

```typescript
export class BackoffPool<Key = string | number> {
  constructor(options?: BackoffPoolOptions)

  success(key: Key): void
  fail(key: Key): void
  applyRandomBackoff(key: Key, range?: number): void

  getInterval(key: Key): number
  getUnlockTime(key: Key): number | undefined

  isLocked(key: Key): boolean
  isAvailable(key: Key): boolean
}

export interface BackoffPoolOptions {
  defaultInterval?: number // default 0
  initialBackoffInterval?: number // default 1 second
  maxBackoffInterval?: number // default unlimited
  backoffFactor?: number // default 2
  randomBackoffRatio?: number // default 0.2 (20%)
}

export let defaultBackoffPoolOptions: Required<BackoffPoolOptions>
```

## Usage Example

<details>
<summary>Login attempt cooldown example</summary>

```typescript
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
```

</details>

More examples see [test/example.ts](./test/example.ts) and [test/core.test.ts](./test/core.test.ts)

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
