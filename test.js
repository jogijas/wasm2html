const fs = require('fs');
const wasm2html = require('@jogijas/wasm2html');

// 1. Read your compiled WebAssembly binary into a Buffer
const wasmBuffer = fs.readFileSync('./app.wasm');
// 2. Read your javascript file into a Buffer
const customJS = fs.readFileSync('./app.js');
// 3. Generate the standalone HTML document string
const htmlContent = wasm2html(wasmBuffer, customJS);
// 4. Save the generated HTML document to disk
fs.writeFileSync('./index.html', htmlContent);

console.log('Successfully bundled WASM into index.html!');
