import React from "react";
import { NavLink } from "react-router-dom";
import { Code2, BookOpen, FlaskConical, Home, Github, Dumbbell, ClipboardList, Server, Zap } from "lucide-react";

const LANGUAGES = [
  { name: "JavaScript", color: "bg-yellow-400" },
  { name: "Python",     color: "bg-sky-400" },
  { name: "Java",       color: "bg-orange-400" },
  { name: "C",          color: "bg-slate-400" },
  { name: "Lua",        color: "bg-indigo-400" },
];

const LINKS = [
  { to: "/",            label: "Accueil",     icon: Home },
  { to: "/apprendre",   label: "Apprendre",   icon: BookOpen },
  { to: "/exercices",   label: "Exercices",   icon: Dumbbell },
  { to: "/dev-fivem",   label: "FiveM",      icon: Server },
  { to: "/quiz",        label: "Quiz",        icon: ClipboardList },
  { to: "/duel",        label: "Duel",        icon: Zap },
  { to: "/bac-a-sable", label: "Bac à sable", icon: FlaskConical },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-[#080c14]">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
                <Code2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Viervier Lyngo</span>
            </div>
            <p className="max-w-xs text-xs leading-relaxed text-slate-500">
              Apprends à coder niveau par niveau, dans le langage de ton choix, directement dans le navigateur.
            </p>
            <p className="font-mono text-[10px] text-slate-600">// Viervier Lyngo — Learn to code</p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {LANGUAGES.map((l) => (
                <span
                  key={l.name}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-2 py-1 text-[10px] font-medium text-slate-500"
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${l.color}`} />
                  {l.name}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Navigation</h3>
            <nav className="flex flex-col gap-1.5">
              {LINKS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                    className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all duration-150 w-fit ${
                      isActive
                        ? "text-emerald-400"
                        : "text-slate-500 hover:text-slate-300"
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Infos */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">À propos</h3>
            <p className="text-xs leading-relaxed text-slate-600">
              30 niveaux progressifs — des bases aux défis avancés. JS et Python s'exécutent vraiment dans le navigateur grâce à Pyodide.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-500 transition-all hover:border-white/[0.1] hover:text-slate-300"
              >
                <Github className="h-3.5 w-3.5" />
                GitHub
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/[0.04] pt-6 sm:flex-row">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} Viervier Lyngo — Tous droits réservés.
          </p>
          <p className="text-xs text-slate-700">
            Construit avec React · Vite · Monaco · Pyodide
          </p>
        </div>
      </div>
    </footer>
  );
}
