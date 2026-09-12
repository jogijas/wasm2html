# @jogijas/wasm2html

A lightweight, zero-dependency Node.js utility and CLI tool that converts any valid WebAssembly (`.wasm`) binary into a standalone, embedded HTML document. 

Out of the box, it automatically parses the internal binary structure to generate an interactive, responsive, zebra-striped signature matrix displaying all exported functions, argument counts, parameter configurations, and return types.

## Features

- 📦 **Embedded Base64 Delivery**: Encodes the WASM binary directly into a single HTML file—perfect for portable environments.
- 🔍 **Universal WASM Type Parsing**: Decodes modern primitives (`i32`, `i64`, `f32`, `f64`), vector types (`v128`), and reference pointers (`funcref`, `externref`).
- 🛡️ **Automatic Magic-Header Verification**: Validates the initial `\0asm` binary sequence before processing to prevent runtime crashes.
- 📊 **Beautiful Interactive Tables**: Automatically populates a clean, zebra-striped HTML data table if no custom JavaScript logic is provided.
- 💻 **Zero-Config CLI**: Run it straight from your terminal using `npx` without adding messy boilerplate folders.

---

## Installation

You can install the package locally in your project:

```bash
npm install @jogijas/wasm2html
```

Or run it directly using `npx`.

---

## Command Line Interface (CLI) Usage

Convert any `.wasm` binary into a single, viewable HTML dashboard instantly:

```bash
npx @jogijas/wasm2html input.wasm output.html
```

### Injecting Custom Script Logic
If you want to bypass the default dashboard table interface and execute custom web interactions with the module instance:

```bash
npx @jogijas/wasm2html input.wasm output.html custom-app.js
```

---

## Programmatic API Usage

You can easily integrate this compiler layout framework directly inside your Node.js application pipelines:

```javascript
const fs = require('fs');
const wasm2html = require('@jogijas/wasm2html');

try {
    // 1. Read your target WASM file into a Node.js Buffer
    const wasmBuffer = fs.readFileSync('math_core.wasm');

    // 2. Compile it directly into a standalone HTML string string
    const htmlOutput = wasm2html(wasmBuffer);

    // 3. Write it out cleanly to disk
    fs.writeFileSync('index.html', htmlOutput);
    console.log('Standalone application compiled successfully!');
} catch (error) {
    console.error('Compilation failed:', error.message);
}
```

### API Signature
```javascript
wasm2html(wasmBuf [, jsContent])
```
- **`wasmBuf`** `(Buffer)`: **Required.** A valid Node.js buffer containing the raw WebAssembly binary data. Throws an error if the `\0asm` header is missing.
- **`jsContent`** `(String)`: *Optional.* Custom browser script string to override the default dashboard execution hook.

---

## Client-Side Helper Utilities

Inside the compiled HTML container, two convenient globally-scoped variables/hooks are exposed for custom developers:

1. **`loadEmbeddedWasm(importObject)`**: An asynchronous wrapper function that instantly resolves your module instance's raw `exports` map.
2. **Global Fetch Interception**: Any traditional browser call pointing to a `.wasm` file pattern string target (e.g., `fetch('app.wasm')`) is automatically intercepted to serve the inline base64 memory buffer variant safely.

---

## Repository & Development

- **GitHub Repository**: [wasm2html](https://github.com/jogijas/wasm2html)
- **Author**: Joginder Jasrotia

## License

This project is licensed under the [MIT License](LICENSE).
