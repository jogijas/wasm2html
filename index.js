/**
 * Converts a WASM buffer and custom JS into a standalone HTML document.
 * @param {Buffer} wasmBuf - The WebAssembly binary buffer.
 * @param {string} jsContent - Custom JavaScript logic to execute in the browser.
 * @returns {string} The complete HTML document string.
 */
module.exports = function wasm2html(wasmBuf, jsContent = '') {
    if (!Buffer.isBuffer(wasmBuf)) {
        throw new TypeError('The first argument must be a Node.js Buffer containing WASM data.');
    }

    const wasmBase64 = wasmBuf.toString('base64');

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WASM Embedded Application</title>
    <style>
    #out{
    width: 70%;
    font-size:1.5em;
    min-height:400px;
    border:1px solid #cce;
    box-shadow:6px 8px 12px #999;
    background:#cef;
    color:#46f;
    margin:20px auto;
    padding:10px 30px;
    }
    </style>
    </head>
    <p id='out'></p>
    <body>
    <script>
    const wasmBase64 = "${wasmBase64}";

    function base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // Intercept fetch requests targeting .wasm files to serve the embedded version
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.endsWith('.wasm')) {
            console.log("Intercepted fetch for WASM framework compliance.");
            const buffer = base64ToUint8Array(wasmBase64);
            return new Response(buffer, {
                headers: { 'Content-Type': 'application/wasm' }
            });
        }
        return originalFetch.apply(this, args);
    };

    // Helper utility to manually instantiate the embedded WebAssembly module
    async function loadEmbeddedWasm(importObject = {}) {
        const wasmBuffer = base64ToUint8Array(wasmBase64);
        const { instance } = await WebAssembly.instantiate(wasmBuffer, importObject);
        return instance.exports;
    }

    // Custom user script logic
    ${jsContent}
    </script>
    </body>
    </html>`;
};
