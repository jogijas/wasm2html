#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const wasm2html = require('./index.js');

// Grab command line arguments
const args = process.argv.slice(2);

// Display instructions if parameters are missing or incorrect
if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
    console.log(`
    \x1b[32m██╗    ██╗ █████╗ ███████╗███╗   ███╗██████╗ ██╗  ██╗████████╗███╗   ███╗██╗
    ██║    ██║██╔══██╗██╔════╝████╗ ████║╚════██╗██║  ██║╚══██╔══╝████╗ ████║██║
    ██║ █╗ ██║███████║███████╗██╔████╔██║ █████╔╝███████║   ██║   ██╔████╔██║██║
    ██║███╗██║██╔══██║╚════██║██║╚██╔╝██║██╔═══╝ ██╔══██║   ██║   ██║╚██╔╝██║██║
    ╚███╔███╔╝██║  ██║███████║██║ ╚═╝ ██║███████╗██║  ██║   ██║   ██║ ╚═╝ ██║███████╗
    ╚══╝╚══╝ ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝╚══════╝\x1b[0m

    Usage:
    \x1b[36mnpx @jogijas/wasm2html <input.wasm> <output.html> [custom-script.js]\x1b[0m

    Options:
    -h, --help    Show this command guide layout information.

    Examples:
    npx @jogijas/wasm2html application.wasm index.html
    npx @jogijas/wasm2html application.wasm index.html custom-logic.js
    `);
    process.exit(0);
}

const inputWasmPath = path.resolve(args[0]);
const outputHtmlPath = path.resolve(args[1]);
const customJsPath = args[2] ? path.resolve(args[2]) : null;

// Validate source file existence
if (!fs.existsSync(inputWasmPath)) {
    console.error(`\x1b[31mError: Target input WASM file not found at path "${inputWasmPath}"\x1b[0m`);
    process.exit(1);
}

try {
    const wasmBuffer = fs.readFileSync(inputWasmPath);
    let jsContent = '';

    if (customJsPath) {
        if (!fs.existsSync(customJsPath)) {
            console.error(`\x1b[31mError: Custom JavaScript asset target path not found at "${customJsPath}"\x1b[0m`);
            process.exit(1);
        }
        jsContent = fs.readFileSync(customJsPath, 'utf8');
    }

    // Process output buffer compilations
    console.log(`\x1b[33mProcessing "${path.basename(inputWasmPath)}"... \x1b[0m`);
    const compiledHtml = wasm2html(wasmBuffer, jsContent);

    fs.writeFileSync(outputHtmlPath, compiledHtml);
    console.log(`\x1b[32mSuccess! Standalone file compiled flawlessly at -> ${outputHtmlPath}\x1b[0m`);

} catch (err) {
    console.error(`\x1b[31mCompilation Failure:\x1b[0m`, err.message);
    process.exit(1);
}
