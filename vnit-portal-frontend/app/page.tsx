"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const stats = [
  { value: "22+",    label: "Departments" },
  { value: "8,000+", label: "Students"    },
  { value: "600+",   label: "Faculty"     },
];

type SessionRow = { id: number; year: string; session: string };

function sessionLabel(s: string) {
  if (s.startsWith("W")) return `${s} — Odd Semester (Jul – Dec)`;
  if (s.startsWith("S")) return `${s} — Even Semester (Jan – Jun)`;
  return s;
}

export default function HomePage() {
  const router = useRouter();

  // Auth fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);

  // Session picker
  const [allSessions,  setAllSessions]  = useState<SessionRow[]>([]);
  const [years,        setYears]        = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [sessionOpts,  setSessionOpts]  = useState<SessionRow[]>([]);
  const [selectedSess, setSelectedSess] = useState("");

  // Load sessions on mount
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/session/all`)
      .then(r => r.json())
      .then((data: SessionRow[]) => {
        setAllSessions(data);
        const uniqueYears = [...new Set(data.map(s => s.year))];
        setYears(uniqueYears);
      })
      .catch(() => {/* silently ignore – session picker is optional */});
  }, []);

  // Filter sessions when year changes
  useEffect(() => {
    if (!selectedYear) { setSessionOpts([]); setSelectedSess(""); return; }
    const opts = allSessions.filter(s => s.year === selectedYear);
    setSessionOpts(opts);
    setSelectedSess("");
  }, [selectedYear, allSessions]);

  async function handleLogin() {
    if (!username || !password) { toast.error("Please enter your credentials"); return; }

    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.detail || "Login failed"); return; }

      // ── Store auth ──
      localStorage.setItem("token",      data.access_token);
      localStorage.setItem("role",       data.role);
      localStorage.setItem("user_name",  data.display_name || "");
      localStorage.setItem("is_advisor", String(data.is_advisor ?? false));
      if (data.student_id) localStorage.setItem("student_id", String(data.student_id));

      // ── Store selected session (or auto-detect) ──
      if (selectedYear && selectedSess) {
        const row    = allSessions.find(s => s.year === selectedYear && s.session === selectedSess);
        const isOdd  = selectedSess.startsWith("W");
        const semNum = isOdd ? 1 : 2;
        localStorage.setItem("current_session",  selectedSess);
        localStorage.setItem("current_semester", String(semNum));
        localStorage.setItem("current_year",     selectedYear);
        localStorage.setItem("session_id",       String(row?.id ?? ""));
        localStorage.setItem("short_session",    `${selectedSess} | Sem ${semNum}`);
      } else {
        // Auto-detect from server
        const sess = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/session/current`)
          .then(r => r.json()).catch(() => null);
        if (sess) {
          localStorage.setItem("current_session",  sess.session);
          localStorage.setItem("current_semester", String(sess.semester));
          localStorage.setItem("current_year",     sess.year);
          localStorage.setItem("short_session",    sess.short_label);
        }
      }

      toast.success(`Welcome, ${data.display_name || data.role}!`);
      router.push("/dashboard");
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* ───── FULL SCREEN BACKGROUND ───── */}
      <Image 
        src="/assets/campus.jpg" 
        alt="VNIT Campus" 
        fill 
        className="object-cover z-0" 
        priority 
      />
      {/* Global overlay gradient to ensure text and form remain readable */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-blue-900/60 to-indigo-950/70 z-0" />
      
      {/* Decorative circles mapped to the background */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl z-0" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl z-0" />

      {/* ───── LEFT CONTENT ───── */}
      <div className="hidden lg:flex lg:w-[58%] relative z-10 flex-col justify-between p-14 text-white">
        {/* Logo */}
        <motion.div initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
            <span className="text-xl font-black">V</span>
          </div>
          <div>
            <p className="font-bold text-base tracking-wide shadow-sm">VNIT Nagpur</p>
            <p className="text-blue-200 text-xs tracking-widest uppercase">AIMS Portal</p>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div initial={{ opacity:0, y:32 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7, delay:0.15 }}>
          <p className="text-blue-300 text-sm font-semibold uppercase tracking-[0.2em] mb-4 drop-shadow-md">
            Academic Information Management System
          </p>
          <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] mb-6 drop-shadow-xl">
            Your Academic<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 drop-shadow-none">
              Journey Starts
            </span><br />
            Here.
          </h1>
          <p className="text-blue-100 text-lg max-w-sm leading-relaxed drop-shadow-md">
            Track attendance, register courses, manage fees, and view results — all in one place.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.7, delay:0.35 }}
          className="grid grid-cols-3 gap-6"
        >
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="text-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl"
            >
              <p className="text-3xl font-black drop-shadow-md">{s.value}</p>
              <p className="text-blue-200 text-xs mt-1 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ───── RIGHT PANEL (Form) ───── */}
      <div className="w-full lg:w-[42%] relative z-10 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55 }}
          className="w-full max-w-md"
        >
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">V</span>
              </div>
              <div className="text-left text-white">
                <p className="font-bold drop-shadow-md">VNIT Nagpur</p>
                <p className="text-blue-200 text-sm">AIMS Portal</p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/40">
            <div className="mb-7">
              <h2 className="text-2xl font-black text-slate-800 mb-1">Welcome back 👋</h2>
              <p className="text-slate-500 text-sm">Sign in to continue to your portal</p>
            </div>

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">
                  Username / Email
                </label>
                <input
                  type="text"
                  placeholder="your@email.com"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="w-full px-4 py-3 pr-14 rounded-xl border border-slate-200 bg-white/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* ── Session Picker ── */}
              <div className="pt-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 h-px bg-slate-200" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
                    Select Session
                  </p>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Academic Year */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                      Academic Year
                    </label>
                    <div className="relative">
                      <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border border-slate-200 bg-white/80 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                      >
                        <option value="">— Year —</option>
                        {years.map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Session */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-1.5">
                      Session
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSess}
                        onChange={e => setSelectedSess(e.target.value)}
                        disabled={!selectedYear}
                        className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl border border-slate-200 bg-white/80 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">— Session —</option>
                        {sessionOpts.map(s => (
                          <option key={s.id} value={s.session}>
                            {sessionLabel(s.session)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Selected session badge */}
                {selectedYear && selectedSess && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <p className="text-xs font-semibold text-blue-700">
                      {selectedYear} · {sessionLabel(selectedSess)}
                    </p>
                  </motion.div>
                )}

                {/* Skip hint */}
                {!selectedYear && (
                  <p className="text-xs text-slate-400 mt-1.5 text-center">
                    Optional — defaults to current active session
                  </p>
                )}
              </div>

              {/* Sign In */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all mt-1 shadow-lg shadow-blue-500/25"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In →"}
              </motion.button>
            </div>

            {/* Admission CTA */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-center text-slate-400 text-sm mb-3">New student?</p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/admission")}
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 rounded-xl transition"
              >
                Apply for Admission
              </motion.button>
            </div>
          </div>

          <p className="text-center text-white/70 text-xs mt-8 drop-shadow-md font-medium">
            Visvesvaraya National Institute of Technology, Nagpur — Est. 1960
          </p>
        </motion.div>
      </div>
    </div>
  );
}