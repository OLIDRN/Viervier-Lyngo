let pyodideInstance = null;
let pyodideLoadingPromise = null;

export function runJavaScript(code) {
  const lines = [];
  const fakeConsole = {
    log: (...args) =>
      lines.push(
        args
          .map((a) =>
            a === null ? "null"
            : a === undefined ? "undefined"
            : typeof a === "object" ? JSON.stringify(a)
            : String(a)
          )
          .join(" ")
      ),
  };
  try {
    // eslint-disable-next-line no-new-func
    new Function("console", code)(fakeConsole);
    return { output: lines.join("\n"), error: null };
  } catch (e) {
    return { output: null, error: e.message };
  }
}

export async function runPython(code) {
  if (!pyodideInstance) {
    if (!pyodideLoadingPromise) {
      const url = "https://cdn.jsdelivr.net/pyodide/v0.27.3/full/pyodide.mjs";
      pyodideLoadingPromise = (async () => {
        const { loadPyodide } = await import(/* @vite-ignore */ url);
        pyodideInstance = await loadPyodide();
      })();
    }
    await pyodideLoadingPromise;
  }
  const lines = [];
  pyodideInstance.setStdout({ batched: (t) => lines.push(t) });
  pyodideInstance.setStderr({ batched: () => {} });
  try {
    await pyodideInstance.runPythonAsync(code);
    return { output: lines.join("\n"), error: null };
  } catch (e) {
    return { output: null, error: e.message || String(e) };
  }
}

export function isPyodideReady() {
  return pyodideInstance !== null;
}
