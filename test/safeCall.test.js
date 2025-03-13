// test/safeCall.test.js

const { safeCall } = require('../src/index');

describe('safeCall', () => {
  test('should return data when function succeeds', async () => {
    const mockFn = async () => "Success";
    const wrappedFn = safeCall(mockFn);
    await expect(wrappedFn()).resolves.toBe("Success");
  });

  test('should catch an error and not throw when function fails', async () => {
    const mockFn = async () => { throw new Error("Test error"); };
    const wrappedFn = safeCall(mockFn);
    await expect(wrappedFn()).rejects.toThrow("Test error");
  });

  test('should retry function when it fails', async () => {
    let attempt = 0;
    const mockFn = async () => {
      attempt++;
      if (attempt < 3) throw new Error("Retry error");
      return "Success";
    };

    const wrappedFn = safeCall(mockFn, { retries: 3 });
    await expect(wrappedFn()).resolves.toBe("Success");
  });
});
