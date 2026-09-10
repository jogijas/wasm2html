module.exports = function wasm2html(wasmBuf,jsContent) {
    const wasm = wasmBuf.toString('base64')

    return `
    const wasmBase64 = "${wasm}";

    function base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }


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

    async function loadEmbeddedWasm(importObject = {}) {
        const wasmBuffer = base64ToUint8Array(wasmBase64);
        const { instance } = await WebAssembly.instantiate(wasmBuffer, importObject);
        return instance.exports;
    }

    ${jsContent}`
