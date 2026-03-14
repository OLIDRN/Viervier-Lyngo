/**
 * Validation partagée des exercices (Exercises + Duel).
 * Utilise codeRunner pour JS/Python et flexibleMatch pour Lua/Java/C.
 */
import { runJavaScript, runPython } from "./codeRunner";

const COMMENT_PREFIXES = ["//", "#", "--"];

function stripComments(str) {
  return str.split("\n").filter((line) => {
    const t = line.trim();
    return t.length > 0 && !COMMENT_PREFIXES.some((p) => t.startsWith(p));
  }).join("\n");
}

function normalizeCode(str) {
  return stripComments(str).replace(/\s+/g, " ").trim().toLowerCase();
}

const OUTPUT_KEYWORD = { javascript: "console.log", python: "print", java: "System.out.println", c: "printf", lua: "print" };

function flexibleMatch(code, exercise, language) {
  const accepted = exercise.acceptedByLanguage?.[language] || [];
  const userNorm = normalizeCode(code);
  const stripped = stripComments(code);
  const keyword = OUTPUT_KEYWORD[language];

  if (accepted.some((s) => normalizeCode(s) === userNorm)) return true;

  const hasKeyword = keyword && stripped.toLowerCase().includes(keyword.toLowerCase());
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

/**
 * Valide le code pour un exercice et une langue.
 * @returns {Promise<{ correct: boolean, output?: string, error?: string }>}
 */
export async function validateExercise(code, exercise, language) {
  if (language === "javascript") {
    const r = runJavaScript(code);
    const output = r.output ?? "";
    let correct = !r.error && r.output === exercise.expectedOutput;
    if (correct && exercise.requiredFunctionName) {
      const stripped = stripComments(code);
      const fn = exercise.requiredFunctionName;
      const hasDef =
        new RegExp(`function\\s+${fn}\\s*\\(`).test(stripped) ||
        new RegExp(`${fn}\\s*=\\s*function`).test(stripped) ||
        new RegExp(`${fn}\\s*=\\s*\\([^)]*\\)\\s*=>`).test(stripped);
      const hasCall = new RegExp(`${fn}\\s*\\(`).test(stripped);
      if (!hasDef || !hasCall) correct = false;
    }
    if (correct && exercise.requiredOperands && exercise.requiredOperator) {
      const stripped = stripComments(code);
      const [a, b] = exercise.requiredOperands;
      const op = exercise.requiredOperator.replace("*", "\\*");
      const hasExpr =
        new RegExp(`${a}\\s*${op}\\s*${b}`).test(stripped) ||
        new RegExp(`${b}\\s*${op}\\s*${a}`).test(stripped);
      if (!hasExpr) correct = false;
    }
    return { correct, output: output || undefined, error: r.error || undefined };
  }

  if (language === "python") {
    const r = await runPython(code);
    const output = r.output ?? "";
    let correct = !r.error && r.output === exercise.expectedOutput;
    if (correct && exercise.requiredFunctionName) {
      const stripped = stripComments(code);
      const fn = exercise.requiredFunctionName;
      const hasDef = new RegExp(`def\\s+${fn}\\s*\\(`).test(stripped);
      const hasCall = new RegExp(`${fn}\\s*\\(`).test(stripped);
      if (!hasDef || !hasCall) correct = false;
    }
    if (correct && exercise.requiredOperands && exercise.requiredOperator) {
      const stripped = stripComments(code);
      const [a, b] = exercise.requiredOperands;
      const op = exercise.requiredOperator.replace("*", "\\*");
      const hasExpr =
        new RegExp(`${a}\\s*${op}\\s*${b}`).test(stripped) ||
        new RegExp(`${b}\\s*${op}\\s*${a}`).test(stripped);
      if (!hasExpr) correct = false;
    }
    return { correct, output: output || undefined, error: r.error || undefined };
  }

  const correct = flexibleMatch(code, exercise, language);
  return { correct };
}
