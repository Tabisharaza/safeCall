const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, Math.max(0, milliseconds)));

class SafeCallTimeoutError extends Error {
  constructor(timeoutMs) {
    super(`Operation timed out after ${timeoutMs}ms`);
    this.name = 'SafeCallTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

const normalizeError = (error) => {
  if (error instanceof Error) return error;
  return new Error(String(error));
};

const runWithTimeout = (fn, timeoutMs) => {
  if (!timeoutMs || timeoutMs <= 0) return Promise.resolve().then(fn);

  return Promise.race([
    Promise.resolve().then(fn),
    new Promise((_, reject) => {
      setTimeout(() => reject(new SafeCallTimeoutError(timeoutMs)), timeoutMs);
    }),
  ]);
};

export async function safeCall(fn, options = {}) {
  if (typeof fn !== 'function') {
    throw new TypeError('safeCall expected a function');
  }

  const {
    retries = 0,
    delayMs = 0,
    backoff = 1,
    timeoutMs = 0,
    onError,
    onSuccess,
    onFinally,
  } = options;

  const startedAt = Date.now();
  const maxAttempts = Math.max(1, Number(retries) + 1);
  let attempt = 0;
  let lastError = null;

  while (attempt < maxAttempts) {
    attempt += 1;

    try {
      const data = await runWithTimeout(fn, Number(timeoutMs));
      const result = {
        ok: true,
        data,
        error: null,
        attempts: attempt,
        durationMs: Date.now() - startedAt,
      };

      if (typeof onSuccess === 'function') {
        await onSuccess(result);
      }

      if (typeof onFinally === 'function') {
        await onFinally(result);
      }

      return result;
    } catch (error) {
      lastError = normalizeError(error);

      if (typeof onError === 'function') {
        await onError(lastError, attempt);
      }

      const shouldRetry = attempt < maxAttempts;
      if (shouldRetry && delayMs > 0) {
        const wait = Number(delayMs) * Math.pow(Number(backoff) || 1, attempt - 1);
        await sleep(wait);
      }
    }
  }

  const result = {
    ok: false,
    data: null,
    error: lastError,
    attempts: attempt,
    durationMs: Date.now() - startedAt,
  };

  if (typeof onFinally === 'function') {
    await onFinally(result);
  }

  return result;
}

export { SafeCallTimeoutError };
