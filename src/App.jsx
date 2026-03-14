import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/Home";
import LearnPage from "./pages/Learn";
import SandboxPage from "./pages/Sandbox";
import ExercisesPage from "./pages/Exercises";
import QuizPage from "./pages/Quiz";
import DevFiveMPage from "./pages/DevFiveM";
import DuelPage from "./pages/Duel";
import NotFound from "./pages/NotFound";

function SkipLink() {
  return (
    <a
      href="#main-content"
      className="fixed left-4 top-4 z-[100] -translate-y-16 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#080c14]"
    >
      Aller au contenu
    </a>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/apprendre" element={<LearnPage />} />
          <Route path="/exercices" element={<ExercisesPage />} />
          <Route path="/bac-a-sable" element={<SandboxPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/dev-fivem" element={<DevFiveMPage />} />
          <Route path="/duel" element={<DuelPage />} />
          <Route path="/duel/room/:code" element={<DuelPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SkipLink />
      <Navbar />
      {/* Fond avec grille + lueurs (derrière tout le contenu) */}
      <div className="fixed inset-0 -z-10 app-bg" aria-hidden="true">
        <div className="absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[400px] w-[400px] translate-x-1/3 rounded-full bg-cyan-600/[0.06] blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 h-[350px] w-[350px] -translate-y-1/2 rounded-full bg-emerald-500/[0.05] blur-[90px]" />
      </div>
      <div className="min-h-screen pt-14" id="main-content" role="main">
        <AnimatedRoutes />
      </div>
      <Footer />
    </BrowserRouter>
  );
}
