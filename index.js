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

    // --- AUTOMATIC WASM VALIDATION CHECK ---
    // WebAssembly magic header: 0x00 0x61 0x73 0x6d ('\0asm')
    if (wasmBuf.length < 4 ||
        wasmBuf[0] !== 0x00 ||
        wasmBuf[1] !== 0x61 ||
        wasmBuf[2] !== 0x73 ||
        wasmBuf[3] !== 0x6d) {
        throw new Error('Invalid input file. The provided buffer does not contain a valid WebAssembly binary magic header (\\0asm).');
        }

        const wasmBase64 = wasmBuf.toString('base64');

    // Default javascript behavior if the user doesn't provide custom logic
    const defaultJsLogic = `
    async function init() {
        const WASM_TYPES = {
            0x7f: "i32", 0x7e: "i64", 0x7d: "f32", 0x7c: "f64",
            0x7b: "v128", 0x70: "funcref", 0x6f: "externref"
        };

        const bytes = base64ToUint8Array(wasmBase64);
        const { instance, module } = await WebAssembly.instantiate(bytes);
        const binaryBytes = new Uint8Array(bytes);
        let offset = 8;

        function readVarUint32() {
            let result = 0, shift = 0;
            while (true) {
                let byte = binaryBytes[offset++];
                result |= (byte & 0x7f) << shift;
                if ((byte & 0x80) === 0) break;
                shift += 7;
            }
            return result;
        }

        function readWasmType() {
            let typeByte = binaryBytes[offset++];
            return WASM_TYPES[typeByte] || \`unknown(0x\${typeByte.toString(16)})\`;
        }

        let parsedTypes = [], funcTypeIndices = [], exportMap = {}, importedFunctionsCount = 0;

        while (offset < binaryBytes.length) {
            let sectionId = binaryBytes[offset++];
            let sectionLength = readVarUint32();
            let sectionEnd = offset + sectionLength;

            if (sectionId === 0) { offset = sectionEnd; continue; }
            if (sectionId === 2) {
                let numImports = readVarUint32();
                for (let i = 0; i < numImports; i++) {
                    readVarUint32(); offset += readVarUint32();
                    readVarUint32(); offset += readVarUint32();
                    if (binaryBytes[offset++] === 0) { readVarUint32(); importedFunctionsCount++; }
                    else if (binaryBytes[offset++] === 1) { readVarUint32(); }
                    else if (binaryBytes[offset++] === 2) { readVarUint32(); binaryBytes[offset++]; }
                    else if (binaryBytes[offset++] === 3) { binaryBytes[offset++]; binaryBytes[offset++]; }
                }
            } else if (sectionId === 1) {
                let numTypes = readVarUint32();
                for (let i = 0; i < numTypes; i++) {
                    binaryBytes[offset++];
                    let numParams = readVarUint32(), params = [];
                    for (let j = 0; j < numParams; j++) params.push(readWasmType());
                    let numResults = readVarUint32(), results = [];
                    for (let j = 0; j < numResults; j++) results.push(readWasmType());
                    parsedTypes.push({ params, results });
                }
            } else if (sectionId === 3) {
                let numFuncs = readVarUint32();
                for (let i = 0; i < numFuncs; i++) funcTypeIndices.push(readVarUint32());
            } else if (sectionId === 7) {
                let numExports = readVarUint32();
                for (let i = 0; i < numExports; i++) {
                    let nameLength = readVarUint32();
                    let name = new TextDecoder().decode(binaryBytes.subarray(offset, offset + nameLength));
                    offset += nameLength;
                    if (binaryBytes[offset++] === 0) exportMap[name] = readVarUint32();
                    else readVarUint32();
                }
            }
            offset = sectionEnd;
        }

        const outputElm = document.getElementById("out");
        if (!outputElm) return;

        let tableHtml = \`
        <h1 style="text-align:center; color:#57dc1d; font-family:sans-serif; margin-bottom:20px;">Detailed WASM Signatures Found:</h1>
        <table style="width:95%; margin:0 auto 30px auto; border-collapse:collapse; font-family:monospace; text-align:left; background-color:#ffffff; border:1px solid #ddd; box-shadow:0 4px 8px rgba(0,0,0,0.05);">
        <thead>
        <tr style="background-color:#2c48c2; color:white;">
        <th style="padding:12px; border:1px solid #ddd;">Function Name</th>
        <th style="padding:12px; border:1px solid #ddd; text-align:center;">Arguments</th>
        <th style="padding:12px; border:1px solid #ddd;">Parameter Types</th>
        <th style="padding:12px; border:1px solid #ddd;">Return Type</th>
        </tr>
        </thead>
        <tbody>
        \`;

        const exportsInfo = WebAssembly.Module.exports(module);
        let rowIndex = 0;

        exportsInfo.forEach(exp => {
            if (exp.kind === "function") {
                const func = instance.exports[exp.name];
                const funcIdx = exportMap[exp.name];
                const adjustedIdx = funcIdx - importedFunctionsCount;
                const typeIdx = funcTypeIndices[adjustedIdx];

                let paramText = "(Unknown/Imported shift)", returnText = "N/A";
                if (typeIdx !== undefined && parsedTypes[typeIdx]) {
                    const sig = parsedTypes[typeIdx];
                    paramText = sig.params.length > 0 ? \`(\${sig.params.join(", ")})\` : "(void)";
                    returnText = sig.results.length > 0 ? \`[\${sig.results.join(", ")}]\` : "[void]";
                }

                const rowBgColor = rowIndex % 2 === 0 ? "#ffffff" : "#f7f9fe";
                rowIndex++;

                tableHtml += \`
                <tr style="background-color: \${rowBgColor}; border-bottom:1px solid #eee; color:#333;">
                <td style="padding:12px; border:1px solid #ddd; font-weight:bold; color:#2c48c2;">\${exp.name}()</td>
                <td style="padding:12px; border:1px solid #ddd; text-align:center; font-weight:bold;">\${func ? func.length : 0}</td>
                <td style="padding:12px; border:1px solid #ddd; color:#555;">\${paramText}</td>
                <td style="padding:12px; border:1px solid #ddd; color:#b52a2a; font-weight:bold;">\${returnText}</td>
                </tr>
                \`;
            }
        });

        tableHtml += \`</tbody></table><h3 style="text-align:center; color:#a55; font-family:sans-serif;">End reading wasm.</h3>\`;
        outputElm.innerHTML = tableHtml;
    }
    init();
    `;

    const finalJsContent = jsContent.trim() !== '' ? jsContent : defaultJsLogic;

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WASM Embedded Application</title>
    <style>
    body { background-color: #f4f6f9; margin: 0; padding: 20px; }
    .out {
        width: 80%;
        min-height: 400px;
        background: #ffffff;
        margin: 20px auto;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    </style>
    </head>
    <body>
    <div id='out' class='out'></div>
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

    ${finalJsContent}
    </script>
    </body>
    </html>`;
};
