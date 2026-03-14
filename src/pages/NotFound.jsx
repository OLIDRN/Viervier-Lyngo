import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, BookOpen, Code2 } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen text-white">
      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] max-w-[800px] flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08]">
            <Code2 className="h-10 w-10 text-slate-500" />
          </div>
          <div>
            <h1 className="font-mono text-4xl font-bold tracking-tight text-white sm:text-5xl">404</h1>
            <p className="mt-2 text-lg text-slate-400">Cette page n'existe pas.</p>
          </div>
          <p className="max-w-md text-sm text-slate-500">
            L'URL est peut-être incorrecte ou la page a été déplacée. Retourne à l'accueil ou lance le parcours d'apprentissage.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-[0.98]"
            >
              <Home className="h-4 w-4" />
              Accueil
            </Link>
            <Link
              to="/apprendre"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white active:scale-[0.98]"
            >
              <BookOpen className="h-4 w-4" />
              Apprendre
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
