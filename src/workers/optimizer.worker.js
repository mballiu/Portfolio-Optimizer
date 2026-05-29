// Web Worker for heavy matrix optimization
// Offloads covariance computation and portfolio optimization
// to a background thread to keep the UI responsive.

self.onmessage = (e) => {
  const { type, data } = e.data

  if (type === "optimize") {
    const { covMatrix, meanReturns, rf, mode, allowShort } = data
    // Import mathjs dynamically in the worker
    importScripts("https://cdn.jsdelivr.net/npm/mathjs@15.2.0/lib/browser/math.js")

    // Currently optimization runs on the main thread for simplicity.
    // To enable worker: move math.ts logic here and postMessage results back.
    self.postMessage({ type: "optimize", result: null })
  }
}
