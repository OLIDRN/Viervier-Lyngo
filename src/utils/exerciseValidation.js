/**
 * Validation partagée des exercices (Learn, Exercises, Duel).
 * JS/Python/Lua : exécution réelle + comparaison de sortie (+ structure optionnelle pour Lua).
 * Java/C : pattern matching (flexibleMatch) faute d'exécution dans le navigateur.
 */
import { runJavaScript, runPython, runLua } from "./codeRunner";

/**
 * Normalise la sortie pour comparaison (fins de ligne, espaces finaux).
 * Les nombres entiers affichés avec décimales (ex. "8.0") sont ramenés à la forme entière ("8").
 */
export function normalizeOutput(s) {
  if (s == null) return "";
  const lines = String(s).replace(/\r\n/g, "\n").trimEnd().split("\n");
  const normalized = lines.map((line) => {
    const t = line.trimEnd();
    const num = parseFloat(t);
    if (t !== "" && !Number.isNaN(num) && Number.isInteger(num)) return String(Math.round(num));
    return t;
  });
  return normalized.join("\n");
}

const COMMENT_PREFIXES = ["//", "#", "--"];

function stripComments(str) {
  return str.split("\n").filter((line) => {
    const t = line.trim();
    return t.length > 0 && !COMMENT_PREFIXES.some((p) => t.startsWith(p));
  }).join("\n");
}

/** Pour comparaison de solutions (ex. isExactMatch). */
export function normalizeCode(str) {
  return stripComments(str).replace(/\s+/g, " ").trim().toLowerCase();
}

const OUTPUT_KEYWORD = { javascript: "console.log", python: "print", java: "System.out.println", c: "printf", lua: "print" };

function flexibleMatch(code, exercise, language) {
  const accepted = exercise.acceptedByLanguage?.[language] || [];
  const userNorm = normalizeCode(code);
  const stripped = stripComments(code);
  const strippedLower = stripped.toLowerCase();
  const keyword = OUTPUT_KEYWORD[language];

  if (accepted.some((s) => normalizeCode(s) === userNorm)) return true;

  if (language === "lua" && exercise.expectedOutput === "client.lua") {
    if (strippedLower.includes("client_script") && strippedLower.includes("client.lua")) return true;
  }

  const hasKeyword = keyword && strippedLower.includes(keyword.toLowerCase());
  if (!hasKeyword) return false;

  if (exercise.requiredFunctionName) {
    const fn = exercise.requiredFunctionName.toLowerCase();
    const hasDef =
      new RegExp(`function\\s+${fn}\\s*\\(|def\\s+${fn}\\s*\\(`, "i").test(stripped) ||
      userNorm.includes(`function ${fn}`) ||
      userNorm.includes(`def ${fn}`);
    const args = exercise.requiredFunctionArgs || [];
    const hasCall =
      args.length === 0
        ? new RegExp(`${fn}\\s*\\(`, "i").test(stripped)
        : new RegExp(`${fn}\\s*\\([^)]*${args[0]}[^)]*${args[1]}`, "i").test(stripped) ||
          new RegExp(`${fn}\\s*\\([^)]*${args[1]}[^)]*${args[0]}`, "i").test(stripped);
    if (!hasDef || !hasCall) return false;
  }

  if (exercise.requiredOperands && exercise.requiredOperator) {
    const [a, b] = exercise.requiredOperands;
    const opChar = exercise.requiredOperator.replace("*", "\\*").replace("+", "\\+").replace("-", "\\-").replace("/", "\\/");
    const hasRequiredExpr =
      new RegExp(`${a}\\s*${opChar}\\s*${b}`).test(stripped) ||
      new RegExp(`${b}\\s*${opChar}\\s*${a}`).test(stripped);
    if (!hasRequiredExpr) return false;
    const expectedNum = Number(exercise.expectedOutput.trim());
    const exprs = stripped.match(/\d+(?:\.\d+)?(?:\s*[\+\-\*\/]\s*\d+(?:\.\d+)?)+/g) || [];
    const correctResult = exprs.some((e) => { try { return eval(e) === expectedNum; } catch { return false; } });
    if (correctResult) return true;
    return false;
  }

  const expectedNum = Number(exercise.expectedOutput.trim());
  const isNumeric = !isNaN(expectedNum) && String(expectedNum) === exercise.expectedOutput.trim();
  if (isNumeric) {
    const exprs = stripped.match(/\d+(?:\.\d+)?(?:\s*[\+\-\*\/]\s*\d+(?:\.\d+)?)+/g) || [];
    if (exprs.some((e) => { try { return eval(e) === expectedNum; } catch { return false; } })) return true;
    return false;
  }

  const esc = exercise.expectedOutput.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (new RegExp(`["'\`]${esc}["'\`]`).test(stripped)) return true;
  return false;
}

/** Vérifie que le code contient au moins un des motifs (chaîne, ou "regex:..." pour une regex). */
function checkStructure(code, patterns) {
  const stripped = stripComments(code);
  return patterns.some((pat) => {
    if (typeof pat !== "string") return new RegExp(pat).test(stripped);
    if (pat.startsWith("regex:")) return new RegExp(pat.slice(6)).test(stripped);
    return stripped.includes(pat);
  });
}

/**
 * Valide le code pour un exercice et une langue.
 * @returns {Promise<{ correct: boolean, output?: string, error?: string, structureRejected?: boolean, structureRejectedMessage?: string }>}
 */
export async function validateExercise(code, exercise, language) {
  const runAndCheck = (correct, output, error) => {
    let structureRejected = false;
    const patterns = exercise.requireStructure?.[language];
    if (correct && Array.isArray(patterns) && patterns.length > 0 && !checkStructure(code, patterns)) {
      correct = false;
      structureRejected = true;
    }
    const forbidden = exercise.forbiddenStructure?.[language];
    if (correct && Array.isArray(forbidden) && forbidden.length > 0 && checkStructure(code, forbidden)) {
      correct = false;
      structureRejected = true;
    }
    const out = { correct, output: output || undefined, error: error || undefined };
    if (structureRejected) {
      out.structureRejected = true;
      out.structureRejectedMessage = exercise.structureRejectedMessage ?? exercise.forbiddenStructureMessage;
    }
    return out;
  };

  if (language === "javascript") {
    const r = runJavaScript(code);
    const output = r.output ?? "";
    const correct = !r.error && normalizeOutput(r.output) === normalizeOutput(exercise.expectedOutput);
    return runAndCheck(correct, output, r.error);
  }

  if (language === "python") {
    const r = await runPython(code);
    const output = r.output ?? "";
    const correct = !r.error && normalizeOutput(r.output) === normalizeOutput(exercise.expectedOutput);
    return runAndCheck(correct, output, r.error);
  }

  const onlyLua = exercise.acceptedByLanguage && Object.keys(exercise.acceptedByLanguage).length === 1 && exercise.acceptedByLanguage.lua;
  const skipRunLua = exercise.isFiveM || onlyLua;
  if (language === "lua" && !skipRunLua) {
    const r = runLua(code);
    const output = r.output ?? "";
    const correct = !r.error && normalizeOutput(r.output) === normalizeOutput(exercise.expectedOutput);
    return runAndCheck(correct, output, r.error);
  }

  const correct = flexibleMatch(code, exercise, language);
  const forbidden = exercise.forbiddenStructure?.[language];
  if (correct && Array.isArray(forbidden) && forbidden.length > 0 && checkStructure(code, forbidden)) {
    return {
      correct: false,
      structureRejected: true,
      structureRejectedMessage: exercise.forbiddenStructureMessage ?? exercise.structureRejectedMessage,
    };
  }
  return { correct };
}
