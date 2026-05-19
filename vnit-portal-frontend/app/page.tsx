"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const stats = [
  { value: "22+", label: "Departments" },
  { value: "8,000+", label: "Students" },
  { value: "600+", label: "Faculty" },
];

export default function HomePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      toast.error("Please enter your credentials");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.detail || "Login failed"); return; }
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      if (data.student_id) localStorage.setItem("student_id", String(data.student_id));
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch {
      toast.error("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ───── LEFT PANEL ───── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <Image src="/assets/campus.jpg" alt="VNIT Campus" fill className="object-cover blur-sm" priority />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/92 via-blue-900/85 to-indigo-950/90" />

        {/* Decorative circles */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-14 text-white w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <span className="text-xl font-black">V</span>
            </div>
            <div>
              <p className="font-bold text-base tracking-wide">VNIT Nagpur</p>
              <p className="text-blue-300 text-xs tracking-widest uppercase">AIMS Portal</p>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p className="text-blue-300 text-sm font-semibold uppercase tracking-[0.2em] mb-4">
              Academic Information Management System
            </p>
            <h1 className="text-5xl xl:text-6xl font-black leading-[1.1] mb-6">
              Your Academic<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
                Journey Starts
              </span><br />
              Here.
            </h1>
            <p className="text-blue-200/80 text-lg max-w-sm leading-relaxed">
              Track attendance, register courses, manage fees, and view results — all in one place.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="grid grid-cols-3 gap-6"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center p-4 bg-white/5 rounded-2xl border border-white/10"
              >
                <p className="text-3xl font-black">{s.value}</p>
                <p className="text-blue-300 text-xs mt-1 font-medium">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ───── RIGHT PANEL ───── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center bg-slate-50 px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-md"
        >
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">V</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800">VNIT Nagpur</p>
                <p className="text-slate-400 text-sm">AIMS Portal</p>
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 p-8 border border-slate-100">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-800 mb-1">Welcome back 👋</h2>
              <p className="text-slate-500">Sign in to continue to your portal</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">
                  Username / Email
                </label>
                <input
                  type="text"
                  placeholder="your@email.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-600 block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="w-full px-4 py-3 pr-14 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {show ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all duration-200 mt-2 shadow-lg shadow-blue-500/25"
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

          <p className="text-center text-slate-400 text-xs mt-6">
            Visvesvaraya National Institute of Technology, Nagpur — Est. 1960
          </p>
        </motion.div>
      </div>
    </div>
  );
}