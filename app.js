document.addEventListener("DOMContentLoaded", () => {
  async function init() {
    try {
      // 1. Instantiate the inline WASM
      const exports = await loadEmbeddedWasm();
      console.log("WASM Exports Object:", exports);

      // 2. Extract the exported function names (keys)
      const expfn = Object.keys(exports);
      
      // 3. Find the output element
      const output = document.getElementById("out");
      
      if (!output) {
        console.error("Error: Could not find an HTML element with id='out'");
        return;
      }

      // 4. Print the functions to the DOMoutput.innerHTML = "<div style='text-align: center;'><b>Exported functions from your wasm</b></div><br>";

      output.innerHTML = "<h2 style='text-align: center;'>Exported functions from your wasm</h2><br>";

      for (var i = 0; i < expfn.length; i++) {
        output.innerHTML += `${i + 1}. ${expfn[i]}<br>`;
      }

      // 5. Example: How to successfully call one of your functions
      // (e.g., passing 10 and 5 into addNumbers)
      if (exports.addNumbers) {
        const sum = exports.addNumbers(10, 5);
        console.log("Result of addNumbers(10, 5):", sum);
        output.innerHTML +=`<br><h5 style='text-align: center;'>Result of addNumbers(10, 5):, ${sum}</h5>`;
      }

    } catch (err) {
      console.error("Failed to execute embedded WASM:", err);
    }
  }
  
  init();
});
