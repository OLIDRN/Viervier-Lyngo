import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "@monaco-editor/react";
import {
  Code2,
  Plus,
  LogIn,
  Users,
  Play,
  Trophy,
  Zap,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { THEMES, EXERCISES } from "../data/exercisesData";
import { validateExercise } from "../utils/exerciseValidation";

const LANGUAGES = {
  javascript: { label: "JavaScript", extension: "js", monacoLang: "javascript", starter: "// Ton code ici\n" },
  python: { label: "Python", extension: "py", monacoLang: "python", starter: "# Ton code ici\n" },
  java: { label: "Java", extension: "java", monacoLang: "java", starter: "// Ton code ici\n" },
  c: { label: "C", extension: "c", monacoLang: "c", starter: "// Ton code ici\n" },
  lua: { label: "Lua", extension: "lua", monacoLang: "lua", starter: "-- Ton code ici\n" },
};

const MAX_MEMBERS = 5;

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

// ── Landing : créer ou rejoindre ─────────────────────────────────────────────
function DuelLanding({ onConfigure }) {
  const navigate = useNavigate();
  const [createName, setCreateName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinName, setJoinName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createRoom = async (e) => {
    e.preventDefault();
    if (!createName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const code = generateCode();
      const hostId = crypto.randomUUID();
      const { data: room, error: err } = await supabase
        .from("duel_rooms")
        .insert({ code, host_id: hostId, theme_id: "bases", status: "waiting", round_count: 3 })
        .select("id")
        .single();
      if (err) throw err;
      await supabase.from("duel_room_members").insert({
        room_id: room.id,
        user_name: createName.trim(),
        user_id: hostId,
        language: "javascript",
      });
      navigate(`/duel/room/${code}`, { state: { hostId, userId: hostId, userName: createName.trim() } });
    } catch (e) {
      setError(e.message || "Erreur création salon");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    const code = (joinCode || "").trim().toUpperCase();
    if (!code || !joinName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const { data: room, error: err } = await supabase.from("duel_rooms").select("id, status").eq("code", code).single();
      if (err || !room) throw new Error("Salon introuvable");
      if (room.status !== "waiting") throw new Error("La partie a déjà commencé");
      const { count } = await supabase.from("duel_room_members").select("id", { count: "exact", head: true }).eq("room_id", room.id);
      if (count >= MAX_MEMBERS) throw new Error("Salon complet");
      const userId = crypto.randomUUID();
      await supabase.from("duel_room_members").insert({
        room_id: room.id,
        user_name: joinName.trim(),
        user_id: userId,
        language: "javascript",
      });
      navigate(`/duel/room/${code}`, { state: { userId, userName: joinName.trim() } });
    } catch (e) {
      setError(e.message || "Erreur rejoindre");
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured()) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mx-auto max-w-xl overflow-hidden rounded-2xl border border-amber-500/25 bg-[#0d1117] shadow-xl"
      >
        <div className="h-1 w-full bg-gradient-to-r from-amber-600 to-amber-400" />
        <div className="p-8 text-center">
          <p className="mb-3 font-medium text-amber-200">Le duel de code nécessite Supabase (temps réel).</p>
          <p className="mb-6 text-sm leading-relaxed text-slate-400">
            Ajoute <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">VITE_SUPABASE_URL</code> et{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">VITE_SUPABASE_ANON_KEY</code> dans{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">.env</code>, crée les tables (voir{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">docs/DUEL.md</code>) puis recharge.
          </p>
          <button
            type="button"
            onClick={onConfigure}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-2.5 text-sm font-medium text-amber-200 transition-colors hover:bg-amber-500/20"
          >
            J'ai configuré, recharger
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-4xl space-y-8"
    >
      {/* En-tête aligné avec le reste de l'app */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117]/90 shadow-xl">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400" />
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/25">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-mono text-xl font-bold tracking-tight text-white sm:text-2xl">Duel de code</h1>
              <p className="mt-1 text-sm text-slate-500">Même exercice, même thème — le plus rapide gagne.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="h-4 w-4 text-emerald-400/80" />
              Jusqu'à {MAX_MEMBERS} joueurs
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-500">Thème choisi par l'hôte</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={createRoom}
          className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/95 p-6 shadow-xl transition-shadow hover:shadow-emerald-500/5"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
              <Plus className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-mono font-semibold text-white">Créer un salon</h2>
              <p className="text-xs text-slate-500">Tu deviens l'hôte et choisis le thème.</p>
            </div>
          </div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">Pseudo</label>
          <input
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Comment t'appeler ?"
            className="mb-5 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            maxLength={30}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le salon"}
          </button>
        </form>

        <form
          onSubmit={joinRoom}
          className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/95 p-6 shadow-xl transition-shadow hover:shadow-sky-500/5"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20">
              <LogIn className="h-5 w-5 text-sky-400" />
            </div>
            <div>
              <h2 className="font-mono font-semibold text-white">Rejoindre un salon</h2>
              <p className="text-xs text-slate-500">Avec le code partagé par l'hôte.</p>
            </div>
          </div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">Code du salon</label>
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Ex. ABC123"
            className="mb-4 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 font-mono text-lg tracking-widest text-white placeholder-slate-500 transition-colors focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
            maxLength={6}
          />
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">Pseudo</label>
          <input
            type="text"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
            placeholder="Comment t'appeler ?"
            className="mb-5 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
            maxLength={30}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 text-sm font-medium text-white shadow-lg shadow-sky-600/25 transition-all hover:bg-sky-500 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rejoindre"}
          </button>
        </form>
      </div>

      {/* Règles rapides */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        <h3 className="mb-3 font-mono text-sm font-semibold text-slate-400">Comment ça marche</h3>
        <ul className="grid gap-2 text-sm text-slate-500 sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-400">1</span>
            L'hôte crée le salon et partage le lien ou le code.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-400">2</span>
            Jusqu'à {MAX_MEMBERS} joueurs rejoignent et choisissent leur langue.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-400">3</span>
            L'hôte choisit le thème (bases, boucles, etc.) et lance la partie.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-emerald-500/20 text-xs font-bold text-emerald-400">4</span>
            Premier à soumettre une solution correcte gagne.
          </li>
        </ul>
      </div>
    </motion.div>
  );
}

// ── Room : Lobby + Game + Podium ─────────────────────────────────────────────
function DuelRoom() {
  const { code } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state || {};
  const hostIdRef = useRef(locationState.hostId);
  const userIdRef = useRef(locationState.userId || "");
  const userNameRef = useRef(locationState.userName || "");
  const [joinName, setJoinName] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [themeId, setThemeId] = useState("bases");
  const [roundCount, setRoundCount] = useState(3);
  const [language, setLanguage] = useState("javascript");
  const [exercise, setExercise] = useState(null);
  const [codeContent, setCodeContent] = useState("");
  const [submittedAt, setSubmittedAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [copied, setCopied] = useState(false);
  const startTimeRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);
  const [finalStandings, setFinalStandings] = useState(null);

  const isHost = room && hostIdRef.current && room.host_id === hostIdRef.current;
  const themeForFiveM = themeId === "fivem";
  const effectiveLang = themeForFiveM ? "lua" : language;
  const langConfig = LANGUAGES[effectiveLang] || LANGUAGES.javascript;

  // Charger salon + abo real-time
  useEffect(() => {
    if (!supabase || !code) return;
    const fetchRoom = async () => {
      const { data: r, error } = await supabase.from("duel_rooms").select("*").eq("code", code.toUpperCase()).single();
      if (error || !r) {
        setRoom(null);
        return;
      }
      setRoom(r);
      setThemeId(r.theme_id || "bases");
      setRoundCount(r.round_count ?? 3);
      if (r.exercise_id != null && (r.round_started_at || r.started_at)) {
        const list = EXERCISES[r.theme_id] || [];
        const ex = list.find((e) => e.id === r.exercise_id) || list[0];
        setExercise(ex);
        setCodeContent((LANGUAGES[themeForFiveM ? "lua" : language] || LANGUAGES.javascript).starter);
        startTimeRef.current = new Date(r.round_started_at || r.started_at).getTime();
        setSubmittedAt(null);
      }
    };
    fetchRoom();

    const channel = supabase
      .channel(`room:${code}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "duel_rooms", filter: `code=eq.${code.toUpperCase()}` }, (p) => {
        if (p.new) {
          setRoom(p.new);
          setRoundCount(p.new.round_count ?? 3);
          if (p.new.status === "playing" && p.new.exercise_id != null) {
            const list = EXERCISES[p.new.theme_id] || [];
            const ex = list.find((e) => e.id === p.new.exercise_id) || list[0];
            setExercise(ex);
            setCodeContent((LANGUAGES[p.new.theme_id === "fivem" ? "lua" : "javascript"] || LANGUAGES.javascript).starter);
            const roundStart = p.new.round_started_at || p.new.started_at;
            startTimeRef.current = roundStart ? new Date(roundStart).getTime() : null;
            setSubmittedAt(null);
            setSubmitError("");
          }
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "duel_room_members" }, async () => {
        const { data: roomRow } = await supabase.from("duel_rooms").select("id").eq("code", code.toUpperCase()).single();
        if (roomRow) {
          const { data: m } = await supabase.from("duel_room_members").select("*").eq("room_id", roomRow.id).order("submitted_at", { ascending: true, nullsFirst: false });
          setMembers(m || []);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [code, themeForFiveM]);

  useEffect(() => {
    if (!room) return;
    (async () => {
      const { data: m } = await supabase.from("duel_room_members").select("*").eq("room_id", room.id).order("created_at", { ascending: true });
      setMembers(m || []);
    })();
  }, [room?.id]);

  // Garder themeId et roundCount synchronisés avec la room
  useEffect(() => {
    if (room?.theme_id) setThemeId(room.theme_id);
    if (room?.round_count != null) setRoundCount(room.round_count);
  }, [room?.theme_id, room?.round_count]);

  // Timer (basé sur round_started_at pour la manche en cours)
  useEffect(() => {
    if (room?.status !== "playing" || !startTimeRef.current) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 200);
    return () => clearInterval(t);
  }, [room?.status, room?.round_started_at]);

  // Charger le classement final (duel_round_results) quand la partie est terminée
  useEffect(() => {
    if (room?.status !== "finished" || !room?.id) {
      setFinalStandings(null);
      return;
    }
    (async () => {
      const { data: rows } = await supabase
        .from("duel_round_results")
        .select("user_id, points, round_index")
        .eq("room_id", room.id)
        .order("round_index", { ascending: true });
      if (!rows?.length) {
        setFinalStandings([]);
        return;
      }
      const byUser = {};
      rows.forEach((r) => {
        if (!byUser[r.user_id]) byUser[r.user_id] = { user_id: r.user_id, totalPoints: 0, details: [] };
        byUser[r.user_id].totalPoints += r.points ?? 0;
        byUser[r.user_id].details.push(r.points ?? 0);
      });
      const standings = Object.values(byUser).sort((a, b) => b.totalPoints - a.totalPoints);
      const names = Object.fromEntries(members.map((m) => [m.user_id, m.user_name]));
      standings.forEach((s) => { s.user_name = names[s.user_id] ?? "?"; });
      setFinalStandings(standings);
    })();
  }, [room?.status, room?.id, members]);

  const copyLink = useCallback(() => {
    const url = `${window.location.origin}/duel/room/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const startGame = useCallback(async () => {
    if (!room || !isHost) return;
    const list = EXERCISES[themeId] || [];
    if (list.length === 0) return;
    const ex = list[Math.floor(Math.random() * list.length)];
    const now = new Date().toISOString();
    const count = room.round_count ?? roundCount ?? 3;
    await supabase.from("duel_rooms").update({
      theme_id: themeId,
      exercise_id: ex.id,
      status: "playing",
      started_at: now,
      round_count: count,
      current_round: 1,
      round_started_at: now,
    }).eq("id", room.id);
    setExercise(ex);
    setCodeContent((LANGUAGES[themeId === "fivem" ? "lua" : "javascript"] || LANGUAGES.javascript).starter);
    startTimeRef.current = new Date(now).getTime();
    setSubmittedAt(null);
  }, [room, isHost, themeId, roundCount]);

  const submitSolution = useCallback(async () => {
    if (!exercise || !room || room.status !== "playing" || submittedAt) return;
    const uid = userIdRef.current;
    if (!uid) return;
    setLoading(true);
    setSubmitError("");
    try {
      const result = await validateExercise(codeContent, exercise, effectiveLang);
      if (!result.correct) {
        setSubmitError(result.error || "Résultat incorrect. Réessaie.");
        setLoading(false);
        return;
      }
      const now = new Date().toISOString();
      await supabase.from("duel_room_members").update({ submitted_at: now, correct: true }).eq("room_id", room.id).eq("user_id", uid);
      setSubmittedAt(now);

      // Fin de manche : récupérer les membres ayant soumis (ordre par submitted_at), attribuer points, round_results, reset members, next round ou finished
      const { data: membersWithTimes } = await supabase
        .from("duel_room_members")
        .select("id, user_id, user_name, submitted_at")
        .eq("room_id", room.id)
        .not("submitted_at", "is", null)
        .order("submitted_at", { ascending: true });
      if (!membersWithTimes?.length) return;

      const roundIndex = room.current_round ?? 1;
      const pointsByRank = [3, 2, 1];
      const rows = membersWithTimes.map((m, i) => ({
        room_id: room.id,
        round_index: roundIndex,
        user_id: m.user_id,
        submitted_at: m.submitted_at,
        points: i < 3 ? pointsByRank[i] : 0,
      }));
      await supabase.from("duel_round_results").insert(rows);

      await supabase.from("duel_room_members").update({ submitted_at: null, correct: null }).eq("room_id", room.id);

      const roundCountVal = room.round_count ?? 3;
      if (roundIndex >= roundCountVal) {
        await supabase.from("duel_rooms").update({ status: "finished" }).eq("id", room.id);
        setRoom((r) => (r && r.id === room.id ? { ...r, status: "finished" } : r));
      } else {
        const list = EXERCISES[room.theme_id] || [];
        const nextEx = list.length ? list[Math.floor(Math.random() * list.length)] : null;
        const nextRound = roundIndex + 1;
        const payload = {
          current_round: nextRound,
          round_started_at: new Date().toISOString(),
          ...(nextEx && { exercise_id: nextEx.id }),
        };
        await supabase.from("duel_rooms").update(payload).eq("id", room.id);
        setRoom((r) => (r && r.id === room.id ? { ...r, ...payload } : r));
        if (nextEx) {
          setExercise(nextEx);
          setCodeContent((LANGUAGES[room.theme_id === "fivem" ? "lua" : "javascript"] || LANGUAGES.javascript).starter);
          startTimeRef.current = Date.now();
          setSubmittedAt(null);
          setSubmitError("");
        }
      }
    } catch (e) {
      setSubmitError(e.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }, [exercise, room, codeContent, effectiveLang, submittedAt]);

  if (!code) {
    navigate("/duel");
    return null;
  }

  if (!room) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500/80" />
        <p className="text-slate-500">Chargement du salon…</p>
      </div>
    );
  }

  // Rejoindre si arrivé par lien sans state
  if (room.status === "waiting" && !userIdRef.current) {
    const handleQuickJoin = async (e) => {
      e.preventDefault();
      const name = (joinName || "").trim();
      if (!name) return;
      setJoinLoading(true);
      setJoinError("");
      try {
        const { count } = await supabase.from("duel_room_members").select("id", { count: "exact", head: true }).eq("room_id", room.id);
        if (count >= MAX_MEMBERS) throw new Error("Salon complet");
        const userId = crypto.randomUUID();
        await supabase.from("duel_room_members").insert({
          room_id: room.id,
          user_name: name,
          user_id: userId,
          language: "javascript",
        });
        userIdRef.current = userId;
        userNameRef.current = name;
        setJoinName("");
      } catch (e) {
        setJoinError(e.message || "Erreur");
      } finally {
        setJoinLoading(false);
      }
    };
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-xl">
        <div className="h-1 w-full bg-gradient-to-r from-sky-600 via-sky-500 to-sky-400" />
        <div className="p-8">
          <div className="mb-6 text-center">
            <p className="font-mono font-semibold text-white">Salon {room.code}</p>
            <p className="mt-2 text-sm text-slate-400">Tu n'es pas encore dans ce salon. Entre ton pseudo pour rejoindre.</p>
          </div>
          <form onSubmit={handleQuickJoin} className="space-y-4">
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">Pseudo</label>
            <input
              type="text"
              value={joinName}
              onChange={(e) => setJoinName(e.target.value)}
              placeholder="Comment t'appeler ?"
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-white placeholder-slate-500 transition-colors focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/30"
              maxLength={30}
            />
            {joinError && <p className="text-sm text-rose-400">{joinError}</p>}
            <button
              type="submit"
              disabled={joinLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 py-3 font-medium text-white shadow-lg shadow-sky-600/25 transition-all hover:bg-sky-500 disabled:opacity-50"
            >
              {joinLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Rejoindre le salon"}
            </button>
          </form>
        </div>
      </motion.div>
    );
  }

  // Lobby
  if (room.status === "waiting") {
    const myMember = members.find((m) => m.user_id === userIdRef.current);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl space-y-6">
        {/* Barre salon */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-xl">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400" />
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/duel")}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="font-mono text-lg font-bold tracking-tight text-white">Salon {room.code}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                  <Users className="h-4 w-4 text-emerald-400/80" />
                  {members.length} / {MAX_MEMBERS} joueurs
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              {copied ? "Lien copié" : "Copier le lien"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/95 p-5 shadow-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Joueurs dans le salon</p>
          <ul className="space-y-2">
            {members.map((m, i) => (
              <li
                key={m.id}
                className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.04]"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 font-mono text-sm font-bold text-emerald-400/90">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium text-white">{m.user_name}</span>
                {m.user_id === room.host_id && (
                  <span className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                    Hôte
                  </span>
                )}
                {!themeForFiveM && (
                  <span className="rounded-lg bg-white/[0.06] px-2.5 py-1 font-mono text-xs text-slate-400">
                    {LANGUAGES[m.language]?.label || m.language}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Thème choisi — visible par les joueurs (non-hôtes) */}
        {!isHost && (
          <>
            <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/95 p-5 shadow-lg">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Thème de l'exercice</p>
              <p className="text-sm text-slate-400">
                L'hôte a choisi : <span className={`font-semibold ${THEMES.find((x) => x.id === themeId)?.colorText || "text-white"}`}>{THEMES.find((x) => x.id === themeId)?.title || themeId}</span>
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/95 p-5 shadow-lg">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre d'exercices</p>
              <p className="text-sm text-slate-400">Série de <span className="font-semibold text-white">{room?.round_count ?? roundCount ?? 3}</span> exercices.</p>
            </div>
          </>
        )}

        {!themeForFiveM && (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/95 p-5 shadow-lg">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Langage</p>
            <p className="mb-4 text-sm text-slate-400">Choisis le langage dans lequel tu veux coder pour cet exercice.</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(LANGUAGES).map(([key, { label }]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setLanguage(key);
                    if (myMember) supabase.from("duel_room_members").update({ language: key }).eq("id", myMember.id);
                  }}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    language === key
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                      : "border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-white/[0.12] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {isHost && (
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-xl">
            <div className="border-b border-white/[0.06] bg-white/[0.02] px-5 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Thème (hôte)</p>
              <p className="mt-1 text-sm text-slate-400">Choisis le thème de l'exercice pour tout le monde.</p>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={async () => {
                      setThemeId(t.id);
                      await supabase.from("duel_rooms").update({ theme_id: t.id }).eq("id", room.id);
                    }}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      themeId === t.id
                        ? `${t.colorBg} ${t.colorText} border-current shadow-lg`
                        : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-white/[0.12] hover:text-white"
                    }`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
              <p className="mt-5 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Nombre d'exercices</p>
              <div className="flex flex-wrap gap-2">
                {[3, 5, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={async () => {
                      setRoundCount(n);
                      await supabase.from("duel_rooms").update({ round_count: n }).eq("id", room.id);
                    }}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                      (room.round_count ?? roundCount) === n
                        ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                        : "border-white/[0.08] bg-white/[0.04] text-slate-400 hover:border-white/[0.12] hover:text-white"
                    }`}
                  >
                    {n} exercices
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={startGame}
                disabled={members.length < 1}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-emerald-600 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 disabled:opacity-50 disabled:shadow-none"
              >
                <Play className="h-5 w-5" />
                {members.length < 1 ? "En attente de joueurs…" : "Lancer la partie"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Partie terminée
  if (room.status === "finished") {
    const roundCountVal = room.round_count ?? 3;
    const winner = finalStandings?.[0];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-2xl space-y-6">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-xl">
          <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400" />
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20">
              <Trophy className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="font-mono text-2xl font-bold text-white">Partie terminée</h2>
            <p className="mt-2 text-slate-400">
              Série de {roundCountVal} exercices.
              {winner && (
                <span className="mt-2 block text-lg font-semibold text-amber-300">
                  {winner.user_name} a gagné
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => navigate("/duel")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500"
            >
              <ArrowLeft className="h-5 w-5" />
              Retour au duel
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/95 p-6 shadow-lg">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Trophy className="h-4 w-4 text-amber-400/80" />
            Classement final
          </p>
          {finalStandings === null ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Chargement du classement…
            </div>
          ) : finalStandings.length === 0 ? (
            <p className="py-4 text-center text-slate-500">Aucun résultat enregistré.</p>
          ) : (
            <ul className="space-y-3">
              {finalStandings.map((s, i) => {
                const isFirst = i === 0;
                const detailStr = s.details?.length ? s.details.join(" + ") : "";
                return (
                  <li
                    key={s.user_id}
                    className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                      isFirst ? "border-amber-500/30 bg-amber-500/10" : "border-white/[0.06] bg-white/[0.02]"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-mono text-lg font-bold ${
                        i === 0 ? "bg-amber-500/25 text-amber-400" : i === 1 ? "bg-slate-400/20 text-slate-300" : "bg-emerald-500/15 text-emerald-400/90"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`flex-1 font-medium ${isFirst ? "text-amber-200" : "text-white"}`}>{s.user_name}</span>
                    <span className="text-sm font-semibold text-white">{s.totalPoints} pts</span>
                    {detailStr && <span className="text-xs text-slate-500">({detailStr})</span>}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </motion.div>
    );
  }

  // Game
  if (room.status === "playing" && exercise) {
    const myMember = members.find((m) => m.user_id === userIdRef.current);
    const sortedByTime = [...members].filter((m) => m.submitted_at).sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
    const winner = sortedByTime[0];
    const stillPlaying = members.filter((m) => !m.submitted_at);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-5xl space-y-6">
        {/* Barre exercice + timer + gagnant */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-xl">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400" />
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/duel")}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="font-mono text-lg font-bold tracking-tight text-white">{exercise.title}</p>
                <p className="mt-0.5 text-sm text-slate-500">
                  Exercice {room.current_round ?? 1} / {room.round_count ?? roundCount ?? 3} — le plus rapide gagne la manche.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 font-mono text-lg font-bold text-emerald-400">
                <Zap className="h-5 w-5" />
                {Math.floor(elapsed / 60)}:{(elapsed % 60).toString().padStart(2, "0")}
              </div>
            </div>
            {winner && (
              <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/15 px-5 py-2.5">
                <Trophy className="h-6 w-6 text-amber-400" />
                <span className="font-semibold text-amber-200">{winner.user_name} a gagné</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Consigne — style aligné page exercices */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/95 p-5 shadow-lg">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-500/90">Consigne</p>
            <p className="text-[15px] leading-relaxed text-slate-200">{exercise.task}</p>
            <p className="mt-4 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Sortie attendue</p>
            <pre className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 font-mono text-sm text-emerald-200/95 whitespace-pre-wrap">
              {exercise.expectedOutput}
            </pre>
          </div>

          {/* Éditeur */}
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] border-l-emerald-500/30 bg-[#0d1117]/95 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0d1117] px-4 py-3">
              <span className="font-mono text-xs text-slate-500">
                <span className="text-emerald-500/80">~/duel</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">solution.{langConfig.extension || "js"}</span>
              </span>
              <button
                type="button"
                onClick={submitSolution}
                disabled={loading || !!submittedAt || !!myMember?.submitted_at}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-emerald-600/25 transition-all hover:bg-emerald-500 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : submittedAt || myMember?.submitted_at ? (
                  <>
                    <Check className="h-4 w-4" /> Validé !
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" /> Soumettre
                  </>
                )}
              </button>
            </div>
            {submitError && (
              <div className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
                {submitError}
              </div>
            )}
            <div className="min-h-[300px]">
              <Editor
                height="300px"
                language={langConfig.monacoLang}
                value={codeContent}
                onChange={(v) => setCodeContent(v ?? "")}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  padding: { top: 12, bottom: 12 },
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}
              />
            </div>
          </div>
        </div>

        {/* Classement */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/95 p-5 shadow-lg">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Trophy className="h-4 w-4 text-amber-400/80" />
            Classement
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sortedByTime.map((m, i) => {
              const roundStart = room.round_started_at || room.started_at;
              const sec = roundStart ? Math.round((new Date(m.submitted_at) - new Date(roundStart)) / 1000) : 0;
              const isFirst = i === 0;
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                    isFirst ? "border-amber-500/30 bg-amber-500/10" : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-mono text-lg font-bold ${
                      i === 0 ? "bg-amber-500/25 text-amber-400" : i === 1 ? "bg-slate-400/20 text-slate-300" : "bg-emerald-500/15 text-emerald-400/90"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${isFirst ? "text-amber-200" : "text-white"}`}>{m.user_name}</p>
                    <p className="text-xs text-slate-500">+{sec}s</p>
                  </div>
                </div>
              );
            })}
            {stillPlaying.map((m) => (
              <div key={m.id} className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 opacity-80">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.06] font-mono text-sm text-slate-500">—</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-slate-400">{m.user_name}</p>
                  <p className="text-xs text-slate-600">en cours</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-slate-400">Chargement…</p>
    </div>
  );
}

// ── Page export ─────────────────────────────────────────────────────────────
export default function DuelPage() {
  const [configChecked, setConfigChecked] = useState(false);
  const { pathname } = useLocation();
  const { code } = useParams();
  const isInRoom = pathname.startsWith("/duel/room/") && code;

  useEffect(() => { setConfigChecked(true); }, []);

  return (
    <div className="min-h-screen text-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {!configChecked ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
          </div>
        ) : isInRoom ? (
          <>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 shadow-lg shadow-emerald-600/25">
                <Code2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-mono text-xl font-bold text-white">Duel de code</h1>
                <p className="text-sm text-slate-500">Salon · même exercice, le plus rapide gagne.</p>
              </div>
            </div>
            <DuelRoom />
          </>
        ) : (
          <DuelLanding onConfigure={() => window.location.reload()} />
        )}
      </div>
    </div>
  );
}
