import test from 'node:test';
import assert from 'node:assert/strict';
import { safeCall, SafeCallTimeoutError } from '../src/index.js';

test('returns a successful result for sync functions', async () => {
  const result = await safeCall(() => 'ok');

  assert.equal(result.ok, true);
  assert.equal(result.data, 'ok');
  assert.equal(result.error, null);
  assert.equal(result.attempts, 1);
  assert.equal(typeof result.durationMs, 'number');
});

test('returns a failure result instead of throwing', async () => {
  const result = await safeCall(() => {
    throw new Error('broken');
  });

  assert.equal(result.ok, false);
  assert.equal(result.data, null);
  assert.equal(result.error.message, 'broken');
  assert.equal(result.attempts, 1);
});

test('retries until success', async () => {
  let attempts = 0;

  const result = await safeCall(
    () => {
      attempts += 1;
      if (attempts < 3) throw new Error('not yet');
      return 'done';
    },
    { retries: 3 }
  );

  assert.equal(result.ok, true);
  assert.equal(result.data, 'done');
  assert.equal(result.attempts, 3);
});

test('calls lifecycle hooks', async () => {
  const events = [];

  const result = await safeCall(
    () => {
      events.push('run');
      return 42;
    },
    {
      onSuccess: () => events.push('success'),
      onFinally: () => events.push('finally'),
    }
  );

  assert.equal(result.ok, true);
  assert.deepEqual(events, ['run', 'success', 'finally']);
});

test('returns timeout error when operation exceeds timeoutMs', async () => {
  const result = await safeCall(
    () => new Promise((resolve) => setTimeout(resolve, 50)),
    { timeoutMs: 5 }
  );

  assert.equal(result.ok, false);
  assert.equal(result.error instanceof SafeCallTimeoutError, true);
  assert.equal(result.attempts, 1);
});

test('rejects non-function input', async () => {
  await assert.rejects(() => safeCall(null), /expected a function/);
});
