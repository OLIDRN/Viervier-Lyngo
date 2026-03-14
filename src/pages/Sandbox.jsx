import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import { FlaskConical, Keyboard, Play, RotateCcw, TerminalSquare } from "lucide-react";
import { runJavaScript, runPython, isPyodideReady } from "../utils/codeRunner";

// Thème Monaco aligné avec Viervier (réutilise la même identité que Learn)
function defineViervierTheme(monaco) {
  monaco.editor.defineTheme("viervier-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "10b981", fontStyle: "bold" },
      { token: "string", foreground: "22d3ee" },
      { token: "comment", foreground: "64748b", fontStyle: "italic" },
      { token: "number", foreground: "fbbf24" },
      { token: "type", foreground: "a78bfa" },
      { token: "function", foreground: "34d399" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#e2e8f0",
      "editorLineNumber.foreground": "#475569",
      "editorLineNumber.activeForeground": "#10b981",
      "editorCursor.foreground": "#10b981",
      "editor.selectionBackground": "#10b98126",
      "editor.lineHighlightBackground": "#10b9810f",
      "editorLineHighlightBorder": "#10b98114",
    },
  });
}

const LANGUAGES = {
  javascript: {
    label: "JavaScript",
    short: "JS",
    extension: "js",
    monacoLang: "javascript",
    starter: '// Bac à sable JavaScript\nconsole.log("Hello, World!")\n',
    accent: "#f7df1e",
    dot: "bg-yellow-400",
    badge: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20",
    runs: true,
  },
  python: {
    label: "Python",
    short: "Py",
    extension: "py",
    monacoLang: "python",
    starter: '# Bac à sable Python\nprint("Hello, World!")\n',
    accent: "#4aaeff",
    dot: "bg-sky-400",
    badge: "bg-sky-400/10 text-sky-300 border-sky-400/20",
    runs: true,
  },
  java: {
    label: "Java",
    short: "Java",
    extension: "java",
    monacoLang: "java",
    starter: '// Bac à sable Java\n// Note : Java ne s\'exécute pas dans le navigateur\nSystem.out.println("Hello, World!");\n',
    accent: "#f89820",
    dot: "bg-orange-400",
    badge: "bg-orange-400/10 text-orange-300 border-orange-400/20",
    runs: false,
  },
  c: {
    label: "C",
    short: "C",
    extension: "c",
    monacoLang: "c",
    starter: '// Bac à sable C\n// Note : C ne s\'exécute pas dans le navigateur\nprintf("Hello, World!\\n");\n',
    accent: "#a8b9cc",
    dot: "bg-slate-400",
    badge: "bg-slate-400/10 text-slate-300 border-slate-400/20",
    runs: false,
  },
  lua: {
    label: "Lua",
    short: "Lua",
    extension: "lua",
    monacoLang: "lua",
    starter: '-- Bac à sable Lua\n-- Note : Lua ne s\'exécute pas dans le navigateur\nprint("Hello, World!")\n',
    accent: "#818cf8",
    dot: "bg-indigo-400",
    badge: "bg-indigo-400/10 text-indigo-300 border-indigo-400/20",
    runs: false,
  },
};

function SpinnerDiv() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
    />
  );
}

export default function SandboxPage() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(LANGUAGES.javascript.starter);
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideStatus, setPyodideStatus] = useState("idle");

  const editorRef = useRef(null);
  const submitRef = useRef(null);

  const lang = LANGUAGES[language];

  const handleLanguageChange = (key) => {
    setLanguage(key);
    setCode(LANGUAGES[key].starter);
    setResult(null);
    if (key === "python" && !isPyodideReady()) {
      setPyodideStatus("loading");
      runPython("").then(() => setPyodideStatus("ready")).catch(() => {});
    }
  };

  const runCode = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);
    try {
      if (language === "javascript") {
        const r = runJavaScript(code);
        setResult({ output: r.output, error: r.error });
      } else if (language === "python") {
        if (!isPyodideReady()) setPyodideStatus("loading");
        const r = await runPython(code);
        setPyodideStatus("ready");
        setResult({ output: r.output, error: r.error });
      } else {
        setResult({
          output: null,
          error: `L'exécution de ${lang.label} n'est pas supportée dans le navigateur. Utilise JavaScript ou Python pour tester ton code ici.`,
          unsupported: true,
        });
      }
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, language, code, lang.label]);

  const clearCode = () => {
    setCode(lang.starter);
    setResult(null);
  };

  const handleMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    submitRef.current = runCode;
    defineViervierTheme(monaco);
    monaco.editor.setTheme("viervier-dark");
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      submitRef.current?.();
    });
    editor.focus();
  }, []); // eslint-disable-line

  // Keep submitRef up to date
  submitRef.current = runCode;

  return (
    <div className="min-h-screen text-white">
      <div className="relative mx-auto flex min-h-screen max-w-[1000px] flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117]/90 px-6 py-4 shadow-xl shadow-black/30 backdrop-blur-xl border-b-emerald-500/20"
        >
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" aria-hidden />
          <div className="flex flex-nowrap items-center gap-4 overflow-hidden">
            <div className="flex min-w-0 shrink-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/20">
                <FlaskConical className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-mono text-lg font-bold tracking-tight text-white">Bac à sable</h1>
                <p className="truncate text-xs font-medium text-slate-500">JS & Python exécutables ici</p>
              </div>
            </div>

            {/* Language switcher — une seule ligne, pastilles compactes */}
            <div className="flex shrink-0 flex-nowrap gap-1.5 overflow-x-auto py-1">
              {Object.entries(LANGUAGES).map(([key, item]) => {
                const isActive = language === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleLanguageChange(key)}
                    className={`group flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? `${item.badge} border-current shadow-md ring-1 ring-white/10`
                        : "border-white/[0.08] bg-white/[0.03] text-slate-500 hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-slate-300"
                    }`}
                    title={item.runs ? `${item.label} — exécutable ici` : `${item.label} — syntaxe uniquement`}
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${item.dot} ${!isActive ? "opacity-60 group-hover:opacity-100" : ""}`} />
                    <span>{item.short}</span>
                    {item.runs && (
                      <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-400" title="Exécutable" aria-hidden />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.header>

        {/* Editor card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117]/90 shadow-[0_0_40px_-10px_rgba(16,185,129,0.25)] shadow-xl shadow-black/30 border-emerald-500/10"
        >
          {/* Chrome header — style terminal */}
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d1117] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <div className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="font-mono text-xs text-slate-500">
                <span className="text-emerald-500/80">~/viervier-lyngo</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">sandbox.{lang.extension}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-slate-600 sm:flex">
                <Keyboard className="h-3 w-3" />
                Ctrl+Entrée
              </span>
            </div>
          </div>

          {/* Monaco */}
          <div className="relative border-t border-white/[0.04]">
            <Editor
              height="460px"
              language={lang.monacoLang}
              value={code}
              onChange={(val) => setCode(val ?? "")}
              onMount={handleMount}
              theme="vs-dark"
              loading={
                <div
                  className="flex h-[460px] items-center justify-center bg-[#0d1117] font-mono text-sm text-slate-500"
                  aria-live="polite"
                >
                  <span className="animate-pulse">Chargement de l’éditeur…</span>
                </div>
              }
              options={{
                fontSize: 15,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontLigatures: true,
                lineHeight: 24,
                letterSpacing: 0.5,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                tabSize: 2,
                insertSpaces: true,
                renderLineHighlight: "line",
                roundedSelection: true,
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true, indentation: true },
                suggest: { showKeywords: true, showSnippets: true },
                quickSuggestions: { other: true, comments: false, strings: true },
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                formatOnType: true,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                  vertical: "auto",
                  horizontal: "auto",
                  useShadows: false,
                },
                padding: { top: 20, bottom: 20 },
                overviewRulerLanes: 0,
                hideCursorInOverviewRuler: true,
                overviewRulerBorder: false,
                lineNumbersMinChars: 3,
                lineNumbers: "on",
                folding: true,
                showFoldingControls: "mouseover",
                matchBrackets: "always",
                renderWhitespace: "selection",
              }}
            />
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] bg-[#0d1117] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                <span className={`h-2 w-2 rounded-full ${lang.dot}`} />
                {lang.label}
              </span>
              {language === "python" && pyodideStatus === "loading" && (
                <span className="flex items-center gap-1.5 text-[11px] text-sky-400">
                  <SpinnerDiv />
                  Chargement Python…
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={clearCode}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-slate-400 transition-all duration-150 hover:bg-white/[0.1] hover:text-white"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Effacer
              </button>
              <span className="hidden text-xs text-slate-500 sm:inline" title="Raccourci clavier">
                <Keyboard className="mr-0.5 inline h-3.5 w-3.5" /> Ctrl+Entrée
              </span>
              <button
                type="button"
                onClick={runCode}
                disabled={isRunning || pyodideStatus === "loading"}
                aria-label="Exécuter le code"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 transition-all duration-150 hover:bg-emerald-500 hover:shadow-emerald-500/30 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40"
              >
                {isRunning ? (
                  <>
                    <SpinnerDiv />
                    {pyodideStatus === "loading" ? "Chargement de l'environnement Python…" : "Exécution…"}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Exécuter
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Output — style terminal */}
        <AnimatePresence mode="wait">
          {result !== null ? (
            <motion.div
              key={`${language}-${result.error ? "err" : "ok"}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={`rounded-2xl border p-5 font-mono ${
                result.unsupported
                  ? "border-amber-500/20 bg-amber-500/[0.04]"
                  : result.error
                  ? "border-rose-500/20 bg-rose-500/[0.05]"
                  : "border-emerald-500/20 bg-emerald-500/[0.06]"
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className={`${result.unsupported ? "text-amber-500" : result.error ? "text-rose-500" : "text-emerald-500"}`}>&gt;</span>
                <TerminalSquare className={`h-4 w-4 ${result.unsupported ? "text-amber-400" : result.error ? "text-rose-400" : "text-emerald-400"}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${result.unsupported ? "text-amber-500" : result.error ? "text-rose-500" : "text-emerald-500"}`}>
                  {result.unsupported ? "Non supporté" : result.error ? "Erreur" : "Sortie"}
                </span>
              </div>
              {result.error ? (
                <pre className="overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap break-all text-rose-200">
                  {result.error}
                </pre>
              ) : !result.output ? (
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-[#0d1117]/80 px-3 py-4">
                  <TerminalSquare className="h-4 w-4 flex-shrink-0 text-slate-500" />
                  <span className="text-sm text-slate-500">Aucune sortie</span>
                </div>
              ) : (
                <pre className="overflow-x-auto text-sm leading-relaxed whitespace-pre-wrap break-all text-emerald-200">
                  {result.output}
                </pre>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-white/[0.06] bg-[#0d1117]/50 p-5"
            >
              <div className="mb-2 flex items-center gap-2 font-mono text-xs text-slate-600">
                <span className="text-emerald-500/60">&gt;</span>
                <TerminalSquare className="h-4 w-4" />
                <span>Sortie</span>
              </div>
              <p className="text-sm text-slate-500">Exécute du code pour voir la sortie ici.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
