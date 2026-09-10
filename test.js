const fs = require('fs');
const path = require('path');
const wasm2html = require('./index.js');

// 1. A minimal, valid 8-byte WebAssembly binary magic header (\0asm\0\0\0\1)
// This simulates a real compiled .wasm file buffer for testing purposes
const mockWasmBuffer = Buffer.from([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);

// 2. Custom JavaScript script to mock inside the HTML template
const mockJsContent = `console.log("Test execution sequence triggered successfully.");`;

try {
    console.log('🧪 Starting validation tests for wasm2html package...');

    // Test Case 1: Core generation execution
    const htmlOutput = wasm2html(mockWasmBuffer, mockJsContent);

    if (typeof htmlOutput !== 'string' || htmlOutput.trim() === '') {
        throw new Error('Test Case 1 Failed: wasm2html must return a non-empty string.');
    }
    console.log('✅ Test Case 1 Passed: Output successfully generated as a valid string template.');

    // Test Case 2: Validation of Base64 parsing engine
    const expectedBase64 = mockWasmBuffer.toString('base64');
    if (!htmlOutput.includes(expectedBase64)) {
        throw new Error('Test Case 2 Failed: The generated HTML output does not contain the correctly encoded Base64 WASM stream.');
    }
    console.log('✅ Test Case 2 Passed: Binary payload safely converted and bundled into Base64 format.');

    // Test Case 3: Script attachment validation
    if (!htmlOutput.includes(mockJsContent)) {
        throw new Error('Test Case 3 Failed: Injected custom JavaScript layer was not appended to the output document scope.');
    }
    console.log('✅ Test Case 3 Passed: Custom script orchestration strings successfully integrated into template literals.');

    // Test Case 4: Exception runtime handling for invalid parameters
    try {
        wasm2html('This is an invalid string parameter, not a Buffer');
        throw new Error('Test Case 4 Failed: The module did not throw a TypeError when passing non-Buffer data types.');
    } catch (error) {
        if (error instanceof TypeError) {
            console.log('✅ Test Case 4 Passed: Type validation checks blocking execution chains on non-Buffer formats as expected.');
        } else {
            throw error;
        }
    }

    // Save out a test HTML distribution asset file to verify structural alignment
    const testOutputPath = path.join(__dirname, 'test_output.html');
    fs.writeFileSync(testOutputPath, htmlOutput);
    console.log(`\n🎉 All integration tests passed cleanly! Test artifact output generated at: ${testOutputPath}`);

} catch (error) {
    console.error('\n❌ Execution verification failed during unit testing lifecycle steps:');
    console.error(error.message);
    process.exit(1);
}
