import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Fengari utilise require('os').platform() ; en navigateur on fournit un stub
      os: path.resolve(__dirname, "src/stubs/os.js"),
      // loslib charge 'tmp' (tmpNameSync) ; en navigateur on évite fs/path/crypto
      tmp: path.resolve(__dirname, "src/stubs/tmp.js"),
      // ldblib charge readline-sync pour debug.debug() ; en navigateur on stub (pas de TTY)
      "readline-sync": path.resolve(__dirname, "src/stubs/readline-sync.js"),
    },
  },
});
