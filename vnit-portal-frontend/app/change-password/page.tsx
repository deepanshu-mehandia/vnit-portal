"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { KeyRound, Eye, EyeOff, ShieldCheck, ArrowLeft } from "lucide-react";

export default function ChangePassword() {
  const router = useRouter();
  const [form,    setForm]    = useState({ current: "", next: "", confirm: "" });
  const [show,    setShow]    = useState({ current: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  function toggle(field: keyof typeof show) {
    setShow(s => ({ ...s, [field]: !s[field] }));
  }

  async function handleSubmit() {
    if (!form.current || !form.next || !form.confirm) {
      toast.error("Please fill in all fields"); return;
    }
    if (form.next.length < 6) {
      toast.error("New password must be at least 6 characters"); return;
    }
    if (form.next !== form.confirm) {
      toast.error("New passwords do not match"); return;
    }
    try {
      setLoading(true);
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: form.current, new_password: form.next }),
      });
      setDone(true);
      toast.success("Password changed successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  const strength = form.next.length === 0 ? 0
    : form.next.length < 6  ? 1
    : form.next.length < 10 ? 2
    : /[A-Z]/.test(form.next) && /[0-9]/.test(form.next) ? 4
    : 3;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-500"][strength];

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <motion.button initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 text-sm font-semibold transition"
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
        className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-7 text-white">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
            <KeyRound size={24} />
          </div>
          <h1 className="text-xl font-black">Change Password</h1>
          <p className="text-slate-400 text-sm mt-1">Keep your account secure with a strong password</p>
        </div>

        {/* Form */}
        {!done ? (
          <div className="p-8 space-y-5">
            {(["current", "next", "confirm"] as const).map((field) => {
              const labels = { current: "Current Password", next: "New Password", confirm: "Confirm New Password" };
              return (
                <div key={field}>
                  <label className="text-sm font-semibold text-slate-600 block mb-1.5">
                    {labels[field]}
                  </label>
                  <div className="relative">
                    <input
                      type={show[field] ? "text" : "password"}
                      placeholder="••••••••"
                      value={form[field]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && handleSubmit()}
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                    <button type="button" onClick={() => toggle(field)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Strength meter for new password */}
                  {field === "next" && form.next.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(i => (
                          <div key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= strength ? strengthColor : "bg-slate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-semibold ${
                        strength === 1 ? "text-red-500"
                        : strength === 2 ? "text-amber-500"
                        : strength === 3 ? "text-blue-500"
                        : "text-emerald-600"
                      }`}>
                        {strengthLabel}
                      </p>
                    </div>
                  )}

                  {/* Match indicator for confirm */}
                  {field === "confirm" && form.confirm.length > 0 && (
                    <p className={`text-xs mt-1.5 font-semibold ${
                      form.next === form.confirm ? "text-emerald-600" : "text-red-500"
                    }`}>
                      {form.next === form.confirm ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>
              );
            })}

            <motion.button whileTap={{ scale:0.98 }} onClick={handleSubmit} disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Updating...
                </span>
              ) : "Update Password"}
            </motion.button>
          </div>
        ) : (
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            className="p-12 text-center"
          >
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">Password Updated!</h2>
            <p className="text-slate-500 text-sm mb-6">Your password has been changed successfully.</p>
            <button onClick={() => router.push("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition"
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}