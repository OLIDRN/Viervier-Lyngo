let pyodideInstance = null;
let pyodideLoadingPromise = null;

// ── Lua (Fengari) ─────────────────────────────────────────────────────────
import * as fengari from "fengari";

function runLuaSync(code) {
  const { lauxlib, lualib, lua: luaApi, to_luastring } = fengari;
  const L = lauxlib.luaL_newstate();
  if (!L) return { output: null, error: "Impossible de créer l'état Lua." };
  lualib.luaL_openlibs(L);

  const lines = [];
  const capturePrint = (L) => {
    const n = luaApi.lua_gettop(L);
    const parts = [];
    for (let i = 1; i <= n; i++) {
      lauxlib.luaL_tolstring(L, i, null);
      const s = luaApi.lua_tojsstring(L, -1);
      luaApi.lua_pop(L, 1);
      parts.push(s != null ? s : "?");
    }
    lines.push(parts.join("\t"));
    return 0;
  };

  luaApi.lua_pushjsfunction(L, capturePrint);
  luaApi.lua_setglobal(L, to_luastring("print"));

  const codeStr = to_luastring(code);
  const loadStatus = lauxlib.luaL_loadstring(L, codeStr);
  if (loadStatus !== luaApi.LUA_OK) {
    const err = luaApi.lua_tojsstring(L, -1);
    luaApi.lua_pop(L, 1);
    return { output: null, error: err != null ? err : "Erreur de chargement." };
  }
  const callStatus = luaApi.lua_pcall(L, 0, 0, 0);
  if (callStatus !== luaApi.LUA_OK) {
    const err = luaApi.lua_tojsstring(L, -1);
    luaApi.lua_pop(L, 1);
    return { output: null, error: err != null ? err : "Erreur d'exécution." };
  }
  return { output: lines.join("\n"), error: null };
}

export function runLua(code) {
  try {
    return runLuaSync(code);
  } catch (e) {
    return { output: null, error: e.message || String(e) };
  }
}

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
