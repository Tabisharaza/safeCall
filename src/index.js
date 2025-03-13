// src/index.js

const safeCall = (fn, options = {}) => {
  const { retries = 1, onError, onFinally } = options;

  return async (...args) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const result = await fn(...args);
        return result;
      } catch (error) {
        attempt++;
        if (onError) {
          onError(error, attempt);
        } else {
          console.error(`Attempt ${attempt} failed:`, error.message);
        }
        if (attempt === retries) {
          throw error; // Re-throw error after max retries
        }
      } finally {
        if (onFinally) {
          onFinally();
        } else {
          console.log("Operation completed.");
        }
      }
    }
  };
};

module.exports = { safeCall };
