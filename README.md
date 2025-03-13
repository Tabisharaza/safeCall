# SafeCall Library

A utility to simplify error handling in Node.js. It automatically wraps async functions with `try`, `catch`, and `finally` blocks, making your code cleaner and more maintainable.

## Installation

```bash
npm install safe-call-lib
```

## Usage

### Basic Usage

```javascript
const { safeCall } = require('safe-call-lib');

const riskyFunction = async () => {
  throw new Error("Something went wrong!");
};

const safeFunction = safeCall(riskyFunction);

safeFunction(); // Error is caught and logged automatically.
```

### Custom Error Handling

```javascript
const safeFunction = safeCall(riskyFunction, {
  onError: (error) => {
    console.error("Custom error handler:", error.message);
  },
  onFinally: () => {
    console.log("Cleanup complete.");
  },
});

safeFunction();
```

### Retry Logic

```javascript
const safeFunction = safeCall(riskyFunction, {
  retries: 3,
  onError: (error, attempt) => {
    console.error(`Attempt ${attempt} failed:`, error.message);
  },
});

safeFunction();
```

## API Reference

### `safeCall(fn, options)`

Wraps an asynchronous function and provides automatic error handling.

#### Parameters:
- **`fn`** *(Function)*: The async function to wrap.
- **`options`** *(Object, optional)*: Configuration options for error handling.
  - **`retries`** *(Number, default: 1)*: Number of retry attempts before failing.
  - **`onError`** *(Function, optional)*: Custom error handler `(error, attempt) => {}`.
  - **`onFinally`** *(Function, optional)*: Custom cleanup logic `() => {}`.

## Contributing

Pull requests are welcome! Please follow the contribution guidelines.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

