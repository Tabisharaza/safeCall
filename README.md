# SafeCall

SafeCall is a tiny zero-dependency JavaScript utility for wrapping risky synchronous or asynchronous functions with consistent result objects, retry handling, timeouts, and lifecycle hooks.

It keeps application code calm: no scattered `try/catch`, no swallowed errors, no mystery retries. One small tool, one disciplined contract.

## Features

- Works with sync and async functions
- Returns a predictable `{ ok, data, error, attempts, durationMs }` result
- Optional retries with delay and exponential backoff
- Optional timeout using `Promise.race`
- Optional lifecycle hooks: `onError`, `onSuccess`, `onFinally`
- No dependencies
- Includes Node.js tests

## Install / Use Locally

```bash
git clone https://github.com/Tabisharaza/safeCall.git
cd safeCall
npm test
```

## Basic Usage

```js
import { safeCall } from './src/index.js';

const result = await safeCall(async () => {
  return 'done';
});

if (result.ok) {
  console.log(result.data);
} else {
  console.error(result.error.message);
}
```

## Retry Example

```js
import { safeCall } from './src/index.js';

let attempts = 0;

const result = await safeCall(
  async () => {
    attempts += 1;
    if (attempts < 3) throw new Error('Temporary failure');
    return 'recovered';
  },
  {
    retries: 2,
    delayMs: 100,
    backoff: 2,
  }
);

console.log(result);
```

## Timeout Example

```js
const result = await safeCall(
  () => new Promise(resolve => setTimeout(resolve, 5000)),
  { timeoutMs: 1000 }
);

console.log(result.ok); // false
console.log(result.error.message); // Operation timed out after 1000ms
```

## API

### `safeCall(fn, options)`

| Option | Type | Default | Description |
|---|---:|---:|---|
| `retries` | number | `0` | Number of retry attempts after the first failure |
| `delayMs` | number | `0` | Delay before retrying |
| `backoff` | number | `1` | Delay multiplier per retry |
| `timeoutMs` | number | `0` | Timeout in milliseconds; `0` disables timeout |
| `onError` | function | `undefined` | Called after each failed attempt |
| `onSuccess` | function | `undefined` | Called after success |
| `onFinally` | function | `undefined` | Called once at the end |

## Result Shape

```js
{
  ok: true,
  data: 'value',
  error: null,
  attempts: 1,
  durationMs: 4
}
```

Failure:

```js
{
  ok: false,
  data: null,
  error: Error,
  attempts: 3,
  durationMs: 207
}
```

## Project Scope

SafeCall is intentionally small. It is not a full resilience framework, circuit breaker, queue, logger, or observability platform. It is a clean wrapper for local function execution where predictable outcomes matter.

## License

MIT
