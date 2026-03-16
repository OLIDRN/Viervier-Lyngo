import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  BookOpen,
  Braces,
  CheckCircle2,
  ChevronRight,
  Code2,
  GitBranch,
  HelpCircle,
  Keyboard,
  RefreshCcw,
  RotateCw,
  Server,
  Sparkles,
  TerminalSquare,
  XCircle,
  Zap,
} from "lucide-react";
import { runPython, isPyodideReady } from "../utils/codeRunner";
import { validateExercise } from "../utils/exerciseValidation";
import { THEMES, EXERCISES } from "../data/exercisesData";

// ── Constants ──────────────────────────────────────────────────────────────────

const STORAGE_KEY = "viervier-lyngo-exercises-v1";

const LANGUAGES = {
  javascript: { label: "JavaScript", extension: "js", monacoLang: "javascript", dot: "bg-yellow-400", badge: "bg-yellow-400/10 text-yellow-300 border-yellow-400/20", starter: "// Écris ton code ici\n" },
  python:     { label: "Python",     extension: "py", monacoLang: "python",     dot: "bg-sky-400",    badge: "bg-sky-400/10 text-sky-300 border-sky-400/20",         starter: "# Écris ton code ici\n" },
  java:       { label: "Java",       extension: "java", monacoLang: "java",     dot: "bg-orange-400", badge: "bg-orange-400/10 text-orange-300 border-orange-400/20", starter: "// Écris ton code ici\n" },
  c:          { label: "C",          extension: "c",  monacoLang: "c",          dot: "bg-slate-400",  badge: "bg-slate-400/10 text-slate-300 border-slate-400/20",    starter: "// Écris ton code ici\n" },
  lua:        { label: "Lua",        extension: "lua", monacoLang: "lua",       dot: "bg-emerald-400", badge: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20", starter: "-- Écris ton code ici\n" },
};

const THEME_ICONS = {
  bases:      BookOpen,
  conditions: GitBranch,
  boucles:    RotateCw,
  fonctions:  Braces,
  fivem:      Server,
};

const DIFFICULTY_LABEL = { 1: "Facile", 2: "Moyen", 3: "Difficile" };
const DIFFICULTY_COLOR = {
  1: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  2: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  3: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

/** Indice d'échec pour les langages exécutés (JS/Python/Lua). */
function hintForFailure(actual, expected, error) {
  if (error) return null;
  if (!actual) return "Ton code ne produit aucune sortie. As-tu bien appelé la fonction d'affichage ?";
  if (actual.toLowerCase() === expected.toLowerCase()) return "Presque ! Vérifie les majuscules et minuscules.";
  if (actual.replace(/\s+/g, "") === expected.replace(/\s+/g, "")) return `Le contenu est bon mais le formatage diffère. Tu as affiché : "${actual}". On attend : "${expected}".`;
  return `Ton code affiche "${actual}" mais on attend "${expected}".`;
}

// ── Utils ──────────────────────────────────────────────────────────────────────

function loadStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch { return {}; }
}

function saveStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function SpinnerDiv({ className = "h-4 w-4 border-white/30 border-t-white" }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
      className={`rounded-full border-2 ${className}`}
    />
  );
}

function CodeEditor({ value, onChange, language, onSubmit, height = 340 }) {
  const submitRef = useRef(onSubmit);
  useEffect(() => { submitRef.current = onSubmit; }, [onSubmit]);

  const handleMount = useCallback((editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => submitRef.current?.());
    editor.focus();
  }, []);

  const heightPx = typeof height === "number" ? `${height}px` : height;

  return (
    <Editor
      height={heightPx}
      language={LANGUAGES[language]?.monacoLang || "plaintext"}
      value={value}
      onChange={(val) => onChange(val ?? "")}
      onMount={handleMount}
      theme="vs-dark"
      options={{
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontLigatures: true,
        lineHeight: 22,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        insertSpaces: true,
        autoIndent: "full",
        renderLineHighlight: "line",
        cursorBlinking: "smooth",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        bracketPairColorization: { enabled: true },
        autoClosingBrackets: "always",
        autoClosingQuotes: "always",
        scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
        padding: { top: 16, bottom: 16 },
        overviewRulerLanes: 0,
        lineNumbersMinChars: 3,
      }}
    />
  );
}

// ── Views ──────────────────────────────────────────────────────────────────────

function ThemeGrid({ completed, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="mb-6">
        <h1 className="font-mono text-2xl font-bold tracking-tight text-white">Exercices par thème</h1>
        <p className="mt-1 text-sm text-slate-500">Choisis un thème pour pratiquer à ton rythme — sans progression bloquante.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {THEMES.map((theme) => {
          const Icon = THEME_ICONS[theme.id] || BookOpen;
          const exercises = EXERCISES[theme.id] || [];
          const doneCount = (completed[theme.id] || []).length;
          const pct = exercises.length ? Math.round((doneCount / exercises.length) * 100) : 0;
          return (
            <motion.button
              key={theme.id}
              onClick={() => onSelect(theme)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-2xl border ${theme.colorBorder} ${theme.colorBg} p-5 text-left transition-all duration-150 hover:border-white/[0.12]`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${theme.colorGlow}`}>
                  <Icon className={`h-5 w-5 ${theme.colorText}`} />
                </div>
                <span className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-medium ${theme.colorBadge} ${theme.colorBorder}`}>
                  {doneCount}/{exercises.length}
                </span>
              </div>
              <h2 className={`text-lg font-bold ${theme.colorText}`}>{theme.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">{theme.subtitle}</p>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className="h-full rounded-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                <span>{exercises.length} exercice{exercises.length > 1 ? "s" : ""}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

function ExerciseList({ theme, completed, onSelect, onBack }) {
  const exercises = EXERCISES[theme.id] || [];
  const Icon = THEME_ICONS[theme.id] || BookOpen;
  const doneIds = completed[theme.id] || [];
  const difficulties = [...new Set(exercises.map((e) => e.difficulty))].sort((a, b) => a - b);

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Thèmes
        </button>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.colorGlow}`}>
            <Icon className={`h-5 w-5 ${theme.colorText}`} />
          </div>
          <div>
            <h1 className="font-mono text-xl font-bold text-white">{theme.title}</h1>
            <p className="text-sm text-slate-500">{doneIds.length} / {exercises.length} complétés</p>
          </div>
        </div>
      </div>

      {difficulties.map((diff) => {
        const group = exercises.filter((e) => e.difficulty === diff);
        const doneInGroup = group.filter((e) => doneIds.includes(e.id)).length;
        return (
          <div key={diff} className="mb-6">
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${DIFFICULTY_COLOR[diff]}`}>
                {DIFFICULTY_LABEL[diff]}
              </span>
              <span className="text-xs text-slate-600">{doneInGroup}/{group.length}</span>
            </div>
            <div className="space-y-1.5">
              {group.map((ex) => {
                const done = doneIds.includes(ex.id);
                return (
                  <button
                    key={ex.id}
                    onClick={() => onSelect(ex)}
                    className={`group w-full rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                      done
                        ? "border-emerald-500/20 bg-emerald-500/[0.06] hover:border-emerald-500/30"
                        : "border-white/[0.08] bg-[#0d1117]/60 hover:bg-white/[0.04] hover:border-white/[0.12]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold ${
                        done ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.06] text-slate-500"
                      }`}>
                        {done ? <CheckCircle2 className="h-4 w-4" /> : ex.id}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`truncate text-sm font-medium ${done ? "text-emerald-300" : "text-slate-300 group-hover:text-white"}`}>
                          {ex.title}
                        </div>
                        <div className="mt-0.5 truncate text-xs text-slate-600">{ex.concept}</div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function ExerciseDetail({ theme, exercise, exerciseIndex = 0, exerciseTotal = 0, language, onLanguageChange, languageLocked = false, onBack, onComplete, isCompleted }) {
  const [code, setCode] = useState(LANGUAGES[language]?.starter || "");
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideStatus, setPyodideStatus] = useState("idle");
  const [hintVisible, setHintVisible] = useState(false);
  const [solutionVisible, setSolutionVisible] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const feedbackRef = useRef(null);
  const lang = LANGUAGES[language];

  // Scroll vers le feedback quand un résultat arrive
  useEffect(() => {
    if (result && feedbackRef.current) {
      feedbackRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [result]);

  // Reset when exercise or language changes
  useEffect(() => {
    setCode(lang?.starter || "");
    setResult(null);
    setHintVisible(false);
    setSolutionVisible(false);
    setAttempts(0);
  }, [exercise.id, language]); // eslint-disable-line

  const handleLanguageChange = (key) => {
    onLanguageChange(key);
    if (key === "python" && !isPyodideReady()) {
      setPyodideStatus("loading");
      runPython("").then(() => setPyodideStatus("ready")).catch(() => {});
    }
  };

  const submit = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    try {
      if (language === "python" && !isPyodideReady()) setPyodideStatus("loading");
      const result = await validateExercise(code, exercise, language);
      if (language === "python") setPyodideStatus("ready");

      const output = result.output ?? null;
      const error = result.error ?? null;
      const correct = result.correct;
      let hint = null;
      if (!correct) {
        if (result.structureRejected) {
          hint = result.structureRejectedMessage || "La sortie est correcte, mais il faut utiliser une boucle ou un tableau pour traiter la liste, pas seulement afficher le résultat.";
        } else if (language === "java" || language === "c" || exercise.isFiveM) {
          hint = exercise.isFiveM
            ? "Relis l'énoncé : vérifie que ton code correspond à ce qui est demandé (ex. client_script 'client.lua' pour le manifest)."
            : "Relis l'énoncé : vérifie la fonction d'affichage, le texte exact ou les opérations demandées.";
        } else {
          hint = hintForFailure(output, exercise.expectedOutput, error);
        }
      }

      setAttempts((a) => a + 1);
      setResult({ output, error, correct, hint });
      if (correct) onComplete(exercise.id);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning, language, code, exercise, onComplete]);

  const canonicalSolution = exercise.acceptedByLanguage[language]?.[0] || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {/* Barre de contexte : Thème / Titre · Exercice X/Y */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0d1117]/80 px-4 py-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-slate-400 transition-all hover:bg-white/[0.06] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Liste
        </button>
        <span className="text-slate-600 font-medium">/</span>
        <span className={`text-sm font-semibold ${theme.colorText}`}>{theme.title}</span>
        <span className="text-slate-600">/</span>
        <span className="text-sm font-medium text-slate-300">{exercise.title}</span>
        {exerciseTotal > 0 && (
          <span className="rounded-lg bg-white/[0.06] px-3 py-1 font-mono text-sm text-slate-400">
            Exercice {exerciseIndex}/{exerciseTotal}
          </span>
        )}
        {isCompleted && (
          <span className="ml-auto flex items-center gap-2 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-sm font-medium text-emerald-400">
            <CheckCircle2 className="h-4 w-4" /> Réussi
          </span>
        )}
      </div>

      {/* Carte consigne — hiérarchie claire */}
      <div className="mb-5 rounded-2xl border border-white/[0.1] bg-[#0d1117] shadow-xl shadow-black/40 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-600/80 via-emerald-500/80 to-emerald-400/80" />
        <div className="p-5 lg:px-6 lg:py-5">
          {/* 1. Titre — niveau principal */}
          <h2 className="font-mono text-xl font-bold tracking-tight text-white lg:text-2xl">
            {exercise.title}
          </h2>

          {/* 2. Métadonnées — une ligne discrète sous le titre */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {exerciseTotal > 0 && (
              <span className="font-mono text-slate-500">
                Exercice <span className="font-semibold text-slate-400">{exerciseIndex}</span>
                <span className="text-slate-600">/</span>
                <span className="font-medium text-slate-400">{exerciseTotal}</span>
              </span>
            )}
            {exerciseTotal > 0 && <span className="text-slate-600">·</span>}
            <span className={exercise.difficulty === 1 ? "text-emerald-500/90" : exercise.difficulty === 2 ? "text-amber-500/90" : "text-rose-500/90"}>
              {DIFFICULTY_LABEL[exercise.difficulty]}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{exercise.concept}</span>
          </div>

          {/* 3. Consigne + Sortie — deux blocs bien séparés */}
          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6">
            <div className="flex-1 min-w-0">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-500/90">Consigne</p>
              <p className="text-[15px] leading-[1.7] text-slate-200">{exercise.task}</p>
            </div>
            <div className="flex-shrink-0 lg:w-[240px] lg:min-w-[240px]">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Sortie attendue</p>
              <pre className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 font-mono text-sm text-emerald-200/95 whitespace-pre-wrap break-words">
                {exercise.expectedOutput}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Éditeur — même largeur que la consigne (pleine largeur) */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] border-l-emerald-500/30 bg-[#0d1117]/95 shadow-[0_0_50px_-12px_rgba(16,185,129,0.25)] min-h-[520px] w-full">
          <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d1117] px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <div className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="font-mono text-xs text-slate-500">
                <span className="text-emerald-500/80">~/viervier-lyngo</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">exercice.{lang.extension}</span>
              </span>
            </div>
            <button
              onClick={() => { setCode(lang.starter); setResult(null); }}
              className="flex items-center gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              <RefreshCcw className="h-3 w-3" /> Reset
            </button>
          </div>

          {!languageLocked && (
            <div className="border-b border-white/[0.06] bg-[#0d1117] px-3 py-2">
              <div className="flex flex-wrap gap-1">
                {Object.entries(LANGUAGES).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => handleLanguageChange(key)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                      language === key
                        ? "bg-emerald-600 text-white shadow-emerald-600/25"
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/[0.04] flex-1 flex flex-col min-h-[480px]">
            <div className="flex-1 w-full min-h-[460px]">
              <CodeEditor value={code} onChange={setCode} language={language} onSubmit={submit} height={520} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] bg-[#0d1117] px-4 py-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                <span className={`h-2 w-2 rounded-full ${lang.dot}`} />
                {lang.label}
              </span>
              {language === "python" && pyodideStatus === "loading" && (
                <span className="flex items-center gap-1.5 text-[11px] text-sky-400">
                  <SpinnerDiv className="h-3 w-3 border-sky-400/30 border-t-sky-400" />
                  Chargement Python…
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHintVisible((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {hintVisible ? "Masquer" : "Indice"}
              </button>
              <span className="hidden text-xs text-slate-500 sm:inline" title="Raccourci">
                <Keyboard className="mr-0.5 inline h-3.5 w-3.5" /> Ctrl+Entrée
              </span>
              <button
                type="button"
                onClick={submit}
                disabled={isRunning || pyodideStatus === "loading"}
                aria-label="Soumettre la solution"
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
              >
                {isRunning ? (
                  <>
                    <SpinnerDiv />
                    {pyodideStatus === "loading" ? "Chargement Python…" : "Exécution…"}
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Valider
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Indice — style terminal */}
        <AnimatePresence>
          {hintVisible && (
            <motion.div
              key="hint"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-amber-500/25 bg-[#0d1117]/90 p-4 font-mono"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-amber-400">&gt;</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">Indice</span>
              </div>
              <p className="text-sm leading-relaxed text-amber-200/90">{exercise.hint}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback — style terminal, scroll into view à la soumission */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              ref={feedbackRef}
              key={`${exercise.id}-${result.correct}-${result.error}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl border p-5 font-mono ${
                result.error
                  ? "border-amber-500/25 bg-amber-500/[0.05]"
                  : result.correct
                  ? "border-emerald-500/30 bg-emerald-500/[0.08] shadow-lg shadow-emerald-500/10"
                  : "border-rose-500/25 bg-rose-500/[0.05]"
              }`}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-slate-500">&gt;</span>
                {result.error
                  ? <XCircle className="h-5 w-5 text-amber-400" />
                  : result.correct
                  ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      </motion.span>
                    )
                  : <XCircle className="h-5 w-5 text-rose-400" />
                }
                <span className={`font-semibold ${result.error ? "text-amber-300" : result.correct ? "text-emerald-300" : "text-rose-300"}`}>
                  {result.error ? "Erreur d'exécution" : result.correct ? "Exercice réussi !" : "Pas encore correct"}
                </span>
              </div>

              {result.error && (
                <pre className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0d1117] p-3 font-mono text-sm text-amber-300 whitespace-pre-wrap">
                  {result.error}
                </pre>
              )}

              {result.output !== undefined && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/[0.08] bg-[#0d1117]/80 p-3">
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      <span className="text-emerald-500/80">&gt;</span> Ta sortie
                    </div>
                    {result.output === "" ? (
                      <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-3">
                        <TerminalSquare className="h-4 w-4 flex-shrink-0 text-slate-500" />
                        <span className="text-sm text-slate-500">Aucune sortie</span>
                      </div>
                    ) : (
                      <pre className="font-mono text-sm text-slate-300 whitespace-pre-wrap break-all">
                        {result.output}
                      </pre>
                    )}
                  </div>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
                    <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-500">
                      <span className="text-emerald-400">&gt;</span> Sortie attendue
                    </div>
                    <pre className="font-mono text-sm text-emerald-200 whitespace-pre-wrap">{exercise.expectedOutput}</pre>
                  </div>
                </div>
              )}

              {!result.correct && !result.error && result.hint && (
                <p className="mt-3 text-sm text-slate-300">{result.hint}</p>
              )}

              {!result.correct && attempts >= 3 && !solutionVisible && (
                <button
                  onClick={() => setSolutionVisible(true)}
                  className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  Voir la solution de référence
                </button>
              )}

              {solutionVisible && canonicalSolution && (
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <span className="text-slate-600">&gt;</span> Solution de référence
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0d1117] p-3 font-mono text-sm text-slate-300 whitespace-pre-wrap">
                    {canonicalSolution}
                  </pre>
                </div>
              )}

              {result.correct && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-[#0d1117]/60 p-4">
                  <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Explication
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300">{exercise.explanation}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const [view, setView] = useState("themes"); // "themes" | "list" | "exercise"
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [completed, setCompleted] = useState(() => loadStorage());

  useEffect(() => { saveStorage(completed); }, [completed]);

  const handleComplete = useCallback((exerciseId) => {
    if (!selectedTheme) return;
    setCompleted((prev) => {
      const ids = prev[selectedTheme.id] || [];
      if (ids.includes(exerciseId)) return prev;
      return { ...prev, [selectedTheme.id]: [...ids, exerciseId] };
    });
  }, [selectedTheme]);

  const totalDone = Object.values(completed).flat().length;
  const totalExercises = THEMES.reduce((sum, t) => sum + (EXERCISES[t.id]?.length ?? 0), 0);

  return (
    <div className="min-h-screen text-white">
      <div className={`relative mx-auto px-4 py-5 sm:px-6 lg:px-8 ${view === "exercise" ? "max-w-[1320px]" : "max-w-[1100px]"}`}>

        {/* Page header — style cohérent avec Learn / Sandbox */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117]/90 shadow-xl shadow-black/40"
        >
          <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400" />
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/25">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-mono text-xl font-bold tracking-tight text-white">Exercices par thème</h1>
                <p className="mt-0.5 text-xs text-slate-500">
                  {THEMES.length} thème{THEMES.length > 1 ? "s" : ""} · {totalExercises} exercices
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-slate-400">
                <span className="font-semibold text-white">{totalDone}</span>/{totalExercises} exercices
              </span>
            </div>
          </div>
        </motion.div>

        {/* Views */}
        <AnimatePresence mode="wait">
          {view === "themes" && (
            <motion.div key="themes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ThemeGrid
                completed={completed}
                onSelect={(theme) => { setSelectedTheme(theme); setView("list"); }}
              />
            </motion.div>
          )}

          {view === "list" && selectedTheme && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ExerciseList
                theme={selectedTheme}
                completed={completed}
                onSelect={(ex) => {
                  setSelectedExercise(ex);
                  if (selectedTheme?.id === "fivem") setLanguage("lua");
                  setView("exercise");
                }}
                onBack={() => setView("themes")}
              />
            </motion.div>
          )}

          {view === "exercise" && selectedTheme && selectedExercise && (() => {
            const list = EXERCISES[selectedTheme.id] || [];
            const idx = list.findIndex((e) => e.id === selectedExercise.id);
            const exerciseIndex = idx >= 0 ? idx + 1 : 0;
            const exerciseTotal = list.length;
            return (
              <motion.div key={`ex-${selectedExercise.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ExerciseDetail
                  theme={selectedTheme}
                  exercise={selectedExercise}
                  exerciseIndex={exerciseIndex}
                  exerciseTotal={exerciseTotal}
                  language={selectedTheme.id === "fivem" ? "lua" : language}
                  onLanguageChange={setLanguage}
                  languageLocked={selectedTheme.id === "fivem"}
                  onBack={() => setView("list")}
                  onComplete={handleComplete}
                  isCompleted={(completed[selectedTheme.id] || []).includes(selectedExercise.id)}
                />
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}
