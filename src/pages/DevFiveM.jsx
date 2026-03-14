import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Code2,
  ExternalLink,
  FileCode,
  MessageSquare,
  Server,
  Zap,
} from "lucide-react";

const fade = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.06 } } };

const CONCEPTS = [
  {
    icon: FileCode,
    title: "Resources & fxmanifest",
    desc: "Une resource est un dossier avec un fxmanifest.lua qui déclare les scripts client et serveur.",
    color: "text-sky-400",
  },
  {
    icon: Zap,
    title: "Client vs Serveur",
    desc: "Le client tourne sur la machine du joueur (UI, monde), le serveur gère la logique partagée et les données.",
    color: "text-amber-400",
  },
  {
    icon: Code2,
    title: "Natives",
    desc: "Les natives sont les fonctions du jeu (GetEntityCoords, DrawText, etc.) — tu les appelles comme du Lua normal.",
    color: "text-emerald-400",
  },
  {
    icon: MessageSquare,
    title: "Events",
    desc: "RegisterNetEvent, TriggerServerEvent, TriggerClientEvent : la base de la communication client ↔ serveur.",
    color: "text-violet-400",
  },
];

const LINKS = [
  { label: "Documentation FiveM", url: "https://docs.fivem.net/docs/", desc: "Docs officielles CFX" },
  { label: "Native Reference", url: "https://docs.fivem.net/natives/", desc: "Liste des natives GTA V" },
  { label: "Forum CFX", url: "https://forum.cfx.re/", desc: "Communauté et aides" },
];

export default function DevFiveMPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">
      <div className="relative mx-auto max-w-[900px] px-4 py-12 sm:px-6 lg:px-8">

        {/* Hero */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117]/90 px-6 py-10 shadow-xl shadow-black/30 backdrop-blur-sm border-b-emerald-500/20 sm:px-8 sm:py-12"
        >
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" aria-hidden />
          <div className="flex flex-col items-start gap-6">
            <motion.div variants={fade} className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/25 ring-1 ring-emerald-400/20">
                <Server className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="font-mono text-xs font-medium text-emerald-400/90">dev</span>
                <h1 className="font-mono text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  FiveM — Lua
                </h1>
              </div>
            </motion.div>
            <motion.p variants={fade} className="max-w-xl text-sm leading-relaxed text-slate-400">
              Scripts Lua pour GTA V multi joueur. Resources, client/serveur, natives et events : de quoi poser les bases avant de coder tes propres mods.
            </motion.p>
            <motion.div variants={fade} className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate("/exercices")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 active:scale-[0.98]"
              >
                <BookOpen className="h-4 w-4" />
                Exercices FiveM
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => navigate("/apprendre")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white"
              >
                Revoir les bases Lua
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* Concepts */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="mt-12"
        >
          <h2 className="mb-6 font-mono text-lg font-semibold text-white">
            Concepts clés
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {CONCEPTS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={fade}
                  className="rounded-xl border border-white/[0.08] bg-[#0d1117]/80 p-5 transition-colors hover:border-emerald-500/20 hover:bg-[#0d1117]"
                >
                  <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06] ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mb-1.5 font-mono text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-500">
                    {item.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Exemple de code */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="mt-12"
        >
          <h2 className="mb-4 font-mono text-lg font-semibold text-white">
            Exemple — client.lua
          </h2>
          <motion.div
            variants={fade}
            className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#0d1117] font-mono text-sm"
          >
            <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0d1117] px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500/80" />
              <span className="text-slate-500">client.lua</span>
            </div>
            <pre className="overflow-x-auto p-4 text-slate-300">
              <code>{`-- Thread qui affiche les coords du joueur toutes les 5 secondes
CreateThread(function()
  while true do
    Wait(5000)
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    print(string.format("Position: %.2f, %.2f, %.2f", coords.x, coords.y, coords.z))
  end
end)`}</code>
            </pre>
          </motion.div>
          <p className="mt-2 text-xs text-slate-500">
            CreateThread + Wait évitent de bloquer le jeu ; les natives GetEntityCoords et PlayerPedId viennent du jeu.
          </p>
        </motion.section>

        {/* Liens utiles */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
          className="mt-12"
        >
          <h2 className="mb-4 font-mono text-lg font-semibold text-white">
            Ressources
          </h2>
          <div className="space-y-2">
            {LINKS.map((link) => (
              <motion.a
                key={link.url}
                variants={fade}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-[#0d1117]/80 px-4 py-3 transition-colors hover:border-emerald-500/20 hover:bg-[#0d1117]"
              >
                <div>
                  <div className="font-mono text-sm font-medium text-white">
                    {link.label}
                  </div>
                  <div className="text-xs text-slate-500">{link.desc}</div>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 text-slate-500" />
              </motion.a>
            ))}
          </div>
        </motion.section>

        {/* CTA bas */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-6 text-center"
        >
          <p className="mb-4 text-sm text-slate-300">
            Passe à la pratique avec les exercices FiveM (Lua) dans la section Exercices.
          </p>
          <button
            onClick={() => navigate("/exercices")}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500"
          >
            Voir les exercices FiveM
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.section>
      </div>
    </div>
  );
}
