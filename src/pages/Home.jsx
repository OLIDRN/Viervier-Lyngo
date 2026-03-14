import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Globe,
  Layers,
  Sparkles,
  Terminal as TerminalIcon,
  Trophy,
  Zap,
} from "lucide-react";
import { AnimatedSpan, Terminal, TypingAnimation } from "../components/magicui/Terminal";

const LANGUAGES = [
  { name: "JavaScript", color: "#f7df1e", bg: "bg-yellow-400/10 border-yellow-400/20", text: "text-yellow-300" },
  { name: "Python",     color: "#4aaeff", bg: "bg-sky-400/10 border-sky-400/20",      text: "text-sky-300" },
  { name: "Java",       color: "#f89820", bg: "bg-orange-400/10 border-orange-400/20", text: "text-orange-300" },
  { name: "C",          color: "#a8b9cc", bg: "bg-slate-400/10 border-slate-400/20",  text: "text-slate-300" },
  { name: "Lua",        color: "#818cf8", bg: "bg-indigo-400/10 border-indigo-400/20", text: "text-indigo-300" },
];

const FEATURES = [
  {
    icon: Layers,
    title: "15 niveaux progressifs",
    desc: "De Hello World aux fonctions avancées, chaque niveau introduit un nouveau concept avec une explication pédagogique.",
    color: "text-cyan-400",
    glow: "bg-cyan-500/10",
  },
  {
    icon: Globe,
    title: "5 langages au choix",
    desc: "JavaScript, Python, Java, C ou Lua — apprends dans le langage qui t'attire et change à tout moment.",
    color: "text-sky-400",
    glow: "bg-sky-500/10",
  },
  {
    icon: TerminalIcon,
    title: "Éditeur intégré",
    desc: "Un éditeur Monaco (VS Code) directement dans le navigateur, avec coloration syntaxique et autocomplétion.",
    color: "text-cyan-400",
    glow: "bg-cyan-500/10",
  },
  {
    icon: Zap,
    title: "Feedback immédiat",
    desc: "Ton code est analysé à la soumission. Pour JavaScript, il est réellement exécuté — tu vois ta sortie vs la sortie attendue.",
    color: "text-emerald-400",
    glow: "bg-emerald-500/10",
  },
  {
    icon: Award,
    title: "Badges & séries",
    desc: "Débloque des badges au fil de ta progression et maintiens ta série pour rester motivé.",
    color: "text-emerald-400",
    glow: "bg-emerald-500/10",
  },
  {
    icon: Sparkles,
    title: "Suggestions de style",
    desc: "Si ton code fonctionne mais peut être plus lisible, on te propose la façon la plus courante — sans pénalité.",
    color: "text-rose-400",
    glow: "bg-rose-500/10",
  },
];

const CONCEPTS = [
  "Sortie console", "Chaînes de caractères", "Variables", "Opérateurs",
  "Conditions", "if / else", "Boucle for", "Boucle while",
  "Fonctions", "Paramètres", "Tableaux", "Itération",
  "Dictionnaires", "Valeur de retour", "Synthèse finale",
];

const fade = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.08 } } };

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">

        {/* ── HERO ── */}
        <section className="flex min-h-screen flex-col items-center justify-center py-32 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center gap-6"
          >
            {/* Badge */}
            <motion.div variants={fade}>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Plateforme d'apprentissage interactive
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fade}
              className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl"
            >
              Apprends à <span className="font-mono text-emerald-400">coder</span>{" "}
              <span className="font-mono text-emerald-400/90">niveau par niveau</span>
            </motion.h1>

            {/* Terminal (Magic UI) — premier plan */}
            <motion.div variants={fade} className="relative z-10 w-full max-w-lg">
              <Terminal className="mx-auto border-emerald-500/20 shadow-emerald-500/5">
                <TypingAnimation duration={50} className="text-emerald-400">
                  $ viervier-lyngo --start
                </TypingAnimation>
                <AnimatedSpan className="text-emerald-400/90">
                  ✔ Prérequis OK.
                </AnimatedSpan>
                <AnimatedSpan className="text-emerald-400/90">
                  ✔ Éditeur chargé.
                </AnimatedSpan>
                <TypingAnimation duration={45} className="text-slate-300">
                  Prêt. Ouvre /apprendre pour commencer.
                </TypingAnimation>
              </Terminal>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              variants={fade}
              className="max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg"
            >
              Viervier Lyngo te guide à travers les fondamentaux de la programmation
              avec des exercices pratiques, un vrai éditeur de code et un retour
              intelligent sur tes erreurs.
            </motion.p>

            {/* Language pills */}
            <motion.div variants={fade} className="flex flex-wrap justify-center gap-2">
              {LANGUAGES.map((l) => (
                <span
                  key={l.name}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${l.bg} ${l.text}`}
                >
                  {l.name}
                </span>
              ))}
            </motion.div>

            {/* CTA */}
            <motion.div variants={fade} className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate("/apprendre")}
                className="group flex items-center gap-2 rounded-2xl bg-emerald-600 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-95"
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-2xl border border-white/[0.08] px-8 py-3.5 text-base font-semibold text-slate-400 transition-all hover:border-white/20 hover:text-white"
              >
                En savoir plus
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fade}
              className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-slate-500"
            >
              {[
                { icon: Layers, val: "15", label: "niveaux" },
                { icon: Globe, val: "5", label: "langages" },
                { icon: Trophy, val: "5", label: "badges" },
                { icon: Flame, val: "100%", label: "gratuit" },
              ].map(({ icon: Icon, val, label }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold text-white">{val}</span>
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-10 flex flex-col items-center gap-2"
          >
            <div className="h-10 w-5 rounded-full border border-white/10 flex items-start justify-center pt-1.5">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              />
            </div>
          </motion.div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fade} className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Tout ce qu'il faut pour démarrer
              </h2>
              <p className="mt-3 text-slate-500">
                Pas de compte, pas d'installation. Ouvre le navigateur, c'est parti.
              </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => {
                const Icon = f.icon;
                return (
                  <motion.div
                    key={f.title}
                    variants={fade}
                    className="group rounded-2xl border border-white/[0.06] bg-[#0d1117] p-6 transition-all hover:border-emerald-500/20 hover:bg-[#111827]"
                  >
                    <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.glow}`}>
                      <Icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <h3 className="mb-2 font-semibold text-white">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        {/* ── CURRICULUM ── */}
        <section className="py-24">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.div variants={fade} className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Le programme en 15 niveaux
              </h2>
              <p className="mt-3 text-slate-500">
                Chaque concept s'appuie sur le précédent. Rien n'est laissé au hasard.
              </p>
            </motion.div>

            <motion.div variants={fade} className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {CONCEPTS.map((concept, i) => (
                <div
                  key={concept}
                  className="group flex items-center gap-3 rounded-xl border border-white/[0.05] bg-[#0d1117] px-4 py-3 transition-all hover:border-emerald-500/20 hover:bg-[#111827]"
                >
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 font-mono text-[10px] font-bold text-emerald-400">
                    {i + 1}
                  </div>
                  <span className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                    {concept}
                  </span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── CTA BOTTOM ── */}
        <section className="py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.04] p-12 text-center"
          >
            <div className="relative">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-xl shadow-emerald-600/25">
                  <BookOpen className="h-7 w-7 text-white" />
                </div>
              </div>
              <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Prêt à écrire ton premier programme ?
              </h2>
              <p className="mb-8 text-slate-400">
                Commence par Niveau 1 et progresse à ton rythme. Aucun prérequis.
              </p>
              <button
                onClick={() => navigate("/apprendre")}
                className="group inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-10 py-4 text-base font-semibold text-white shadow-xl shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-95"
              >
                <CheckCircle2 className="h-5 w-5" />
                Démarrer maintenant — c'est gratuit
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}
