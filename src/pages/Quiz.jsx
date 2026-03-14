import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronRight, ClipboardList, RotateCcw, XCircle } from "lucide-react";

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Quelle fonction affiche du texte dans la console en JavaScript ?",
    options: [
      { text: "console.log()", correct: true },
      { text: "print()", correct: false },
      { text: "echo()", correct: false },
      { text: "printf()", correct: false },
    ],
  },
  {
    id: 2,
    question: "En Python, comment déclare-t-on une variable ?",
    options: [
      { text: "let x = 5", correct: false },
      { text: "var x = 5", correct: false },
      { text: "x = 5", correct: true },
      { text: "const x := 5", correct: false },
    ],
  },
  {
    id: 3,
    question: "Quel opérateur donne le reste d'une division entière ?",
    options: [
      { text: "/", correct: false },
      { text: "%", correct: true },
      { text: "//", correct: false },
      { text: "mod", correct: false },
    ],
  },
  {
    id: 4,
    question: "En JavaScript, quelle boucle parcourt les éléments d'un tableau ?",
    options: [
      { text: "for (let i = 0; i < arr.length; i++)", correct: true },
      { text: "foreach (arr)", correct: false },
      { text: "loop arr", correct: false },
      { text: "iterate arr", correct: false },
    ],
  },
  {
    id: 5,
    question: "En Python, comment crée-t-on une fonction ?",
    options: [
      { text: "function maFonction():", correct: false },
      { text: "def maFonction():", correct: true },
      { text: "func maFonction():", correct: false },
      { text: "fn maFonction():", correct: false },
    ],
  },
  {
    id: 6,
    question: "Que renvoie une condition if (score >= 50) si score vaut 50 ?",
    options: [
      { text: "false", correct: false },
      { text: "true", correct: true },
      { text: "0", correct: false },
      { text: "undefined", correct: false },
    ],
  },
  {
    id: 7,
    question: "Quel type de structure associe des clés à des valeurs ?",
    options: [
      { text: "Un tableau", correct: false },
      { text: "Un objet / dictionnaire", correct: true },
      { text: "Une chaîne", correct: false },
      { text: "Un entier", correct: false },
    ],
  },
  {
    id: 8,
    question: "En JavaScript, comment accède-t-on au premier élément d'un tableau ?",
    options: [
      { text: "arr(0)", correct: false },
      { text: "arr[0]", correct: true },
      { text: "arr.first", correct: false },
      { text: "arr{0}", correct: false },
    ],
  },
  {
    id: 9,
    question: "À quoi sert le mot-clé return dans une fonction ?",
    options: [
      { text: "À arrêter l'exécution et renvoyer une valeur", correct: true },
      { text: "À afficher une valeur", correct: false },
      { text: "À répéter la fonction", correct: false },
      { text: "À définir une variable", correct: false },
    ],
  },
  {
    id: 10,
    question: "Quelle boucle continue tant qu'une condition est vraie ?",
    options: [
      { text: "for", correct: false },
      { text: "while", correct: true },
      { text: "repeat", correct: false },
      { text: "loop", correct: false },
    ],
  },
];

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const question = QUIZ_QUESTIONS[currentIndex];
  const total = QUIZ_QUESTIONS.length;
  const isLast = currentIndex === total - 1;
  const answeredCount = Object.keys(answers).length;
  const correctCount = QUIZ_QUESTIONS.filter(
    (q) => answers[q.id] !== undefined && q.options[answers[q.id]]?.correct
  ).length;
  const isFinished = showResult && answeredCount === total;

  const selectOption = (optionIndex) => {
    if (answers[question.id] !== undefined) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }));
  };

  const goNext = () => {
    if (isLast) setShowResult(true);
    else setCurrentIndex((i) => i + 1);
  };

  const restart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="relative mx-auto max-w-[700px] px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117]/90 px-6 py-4 shadow-xl shadow-black/30 backdrop-blur-xl border-b-emerald-500/20"
        >
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" aria-hidden />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/20">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-mono text-lg font-bold tracking-tight text-white">Quiz</h1>
                <p className="text-xs font-medium text-slate-500">Teste tes bases en programmation</p>
              </div>
            </div>
            {!isFinished && (
              <div className="flex items-center gap-2 font-mono text-sm text-slate-500">
                <span className="text-emerald-400">{currentIndex + 1}</span>
                <span>/</span>
                <span>{total}</span>
              </div>
            )}
          </div>
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6"
        >
          <AnimatePresence mode="wait">
            {isFinished ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/90 p-6 shadow-xl shadow-black/30"
              >
                <div className="mb-6 flex flex-col items-center gap-4 text-center">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${correctCount >= total / 2 ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
                    {correctCount >= total / 2 ? (
                      <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                    ) : (
                      <XCircle className="h-8 w-8 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-mono text-xl font-bold text-white">
                      {correctCount} / {total} correct{correctCount > 1 ? "s" : ""}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {correctCount === total
                        ? "Parfait ! Tu maîtrises les bases."
                        : correctCount >= total / 2
                        ? "Bien joué, continue de pratiquer."
                        : "Relis les niveaux Apprendre et réessaie."}
                    </p>
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={restart}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.1] hover:text-white"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Recommencer le quiz
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/90 p-6 shadow-xl shadow-black/30"
              >
                <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wider text-emerald-500/80">
                  Question {currentIndex + 1}
                </div>
                <h2 className="mb-6 text-lg font-medium leading-snug text-white">
                  {question.question}
                </h2>
                <div className="space-y-2">
                  {question.options.map((opt, idx) => {
                    const answered = answers[question.id] !== undefined;
                    const selectedIndex = answers[question.id];
                    const correct = opt.correct;
                    const showCorrect = answered && correct;
                    const showWrong = answered && selectedIndex === idx && !correct;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectOption(idx)}
                        disabled={answered}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                          showCorrect
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            : showWrong
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                            : answered
                            ? "cursor-default border-white/[0.06] bg-white/[0.02] text-slate-500"
                            : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-emerald-500/20 hover:bg-emerald-500/[0.06] hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {showCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                          {showWrong && <XCircle className="h-4 w-4 shrink-0 text-rose-400" />}
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {answers[question.id] !== undefined && (
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={goNext}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500"
                    >
                      {isLast ? "Voir le résultat" : "Suivant"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
