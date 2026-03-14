import React, { useEffect, useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Home, BookOpen, ChevronRight, Flame, FlaskConical, Dumbbell, ClipboardList, Server, Zap } from "lucide-react";

const STORAGE_KEY = "viervier-lyngo-progress-v2";
const TOTAL_LEVELS = 30;

export default function Navbar() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState({ completed: 0, streak: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      setProgress({
        completed: saved.completed?.length ?? 0,
        streak: saved.streak ?? 0,
      });
    } catch {}
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMenu]);

  const pct = Math.round((progress.completed / TOTAL_LEVELS) * 100);

  const links = [
    { to: "/", label: "Accueil", icon: Home },
    { to: "/apprendre", label: "Apprendre", icon: BookOpen },
    { to: "/exercices", label: "Exercices", icon: Dumbbell },
    { to: "/dev-fivem", label: "FiveM", icon: Server },
    { to: "/quiz", label: "Quiz", icon: ClipboardList },
    { to: "/duel", label: "Duel", icon: Zap },
    { to: "/bac-a-sable", label: "Bac à sable", icon: FlaskConical },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* Backdrop blur bar */}
      <div className="border-b border-white/[0.06] bg-[#080c14]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            aria-label="Retour à l'accueil"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
              <Code2 className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">Viervier Lyngo</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]"
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Progress pill — only when user has started */}
            {progress.completed > 0 && (
              <div className="hidden items-center gap-2.5 sm:flex">
                {progress.streak > 0 && (
                  <div className="flex items-center gap-1 rounded-lg border border-orange-500/20 bg-orange-500/[0.08] px-2.5 py-1 text-xs font-medium text-orange-400">
                    <Flame className="h-3 w-3" />
                    {progress.streak}
                  </div>
                )}
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1">
                  <div className="h-1 w-16 overflow-hidden rounded-full bg-white/[0.06]">
                    <motion.div
                      className="h-full rounded-full bg-emerald-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {progress.completed}/{TOTAL_LEVELS}
                  </span>
                </div>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={() => navigate("/apprendre")}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-95"
            >
              {progress.completed > 0 ? "Continuer" : "Commencer"}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            {/* Mobile hamburger */}
            <button
              type="button"
              className="flex h-8 w-8 flex-col items-center justify-center gap-1.5 sm:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label="Menu principal"
            >
              <span className={`h-0.5 w-5 rounded-full bg-slate-400 transition-all ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`h-0.5 w-5 rounded-full bg-slate-400 transition-all ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-0.5 w-5 rounded-full bg-slate-400 transition-all ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/[0.06] sm:hidden"
            >
              <div className="px-4 py-3">
                {links.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${
                        isActive ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
