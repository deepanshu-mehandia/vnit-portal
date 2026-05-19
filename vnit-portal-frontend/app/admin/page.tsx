"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Users, CheckCircle, XCircle, UserCheck,
  Clock, ShieldCheck, BookOpen, Search,
} from "lucide-react";

export default function AdminPage() {
  const router   = useRouter();
  const [role,    setRole]    = useState<string | null>(null);
  const [students,setStudents]= useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token    = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    if (userRole !== "admin" && userRole !== "faculty") { router.push("/dashboard"); return; }
    if (!token) { router.push("/"); return; }
    setRole(userRole);

    async function loadData() {
      try {
        if (userRole === "admin") {
          const res = await apiFetch("/admin/students/all");
          setStudents(res);
        }
        if (userRole === "faculty") {
          const res = await apiFetch("/admin/faculty/pending");
          setPending(res);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    loadData();
  }, []);

  async function assignAdvisor(student_id: number) {
    const faculty_id = prompt("Enter Faculty ID:");
    if (!faculty_id) return;
    await apiFetch("/admin/assign-advisor", {
      method: "POST",
      body: JSON.stringify({ student_ids: [student_id], faculty_id: Number(faculty_id) }),
    });
    toast.success("Advisor assigned");
  }

  async function approve(reg_id: number) {
    await apiFetch("/admin/faculty/approve", { method: "POST", body: JSON.stringify({ reg_id }) });
    toast.success("Approved!");
    setPending(p => p.filter(x => x.reg_id !== reg_id));
  }

  async function reject(reg_id: number) {
    await apiFetch("/admin/faculty/reject", { method: "POST", body: JSON.stringify({ reg_id }) });
    toast.error("Rejected");
    setPending(p => p.filter(x => x.reg_id !== reg_id));
  }

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className={`rounded-3xl p-7 text-white shadow-xl ${
          role === "admin"
            ? "bg-gradient-to-r from-slate-700 to-slate-900 shadow-slate-700/20"
            : "bg-gradient-to-r from-indigo-600 to-violet-700 shadow-indigo-500/20"
        }`}
      >
        <div className="flex items-center gap-3 mb-2">
          {role === "admin" ? <ShieldCheck size={22} /> : <UserCheck size={22} />}
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
            {role === "admin" ? "Administrator" : "Faculty Advisor"}
          </p>
        </div>
        <h1 className="text-2xl font-black">
          {role === "admin" ? "Admin Panel" : "Student Approvals"}
        </h1>
        <p className="text-white/60 text-sm mt-1">
          {role === "admin"
            ? `${students.length} students registered in the system`
            : `${pending.length} pending registration requests`}
        </p>
      </motion.div>

      {/* ── ADMIN: Students Table ── */}
      {role === "admin" && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-black text-slate-800 flex items-center gap-2">
              <Users size={18} /> All Students
            </h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text" placeholder="Search..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
          </div>

          <div className="divide-y divide-slate-50">
            {filtered.map((s, i) => (
              <motion.div
                key={s.student_id}
                initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {s.name?.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm truncate">{s.name}</p>
                  <p className="text-slate-400 text-xs truncate">{s.email}</p>
                </div>
                <button onClick={() => assignAdvisor(s.student_id)}
                  className="text-xs font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl transition whitespace-nowrap"
                >
                  Assign Advisor
                </button>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-slate-400">No students found</div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── FACULTY: Pending Approvals ── */}
      {role === "faculty" && (
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-black text-slate-800 flex items-center gap-2">
              <Clock size={18} /> Pending Registrations
              {pending.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pending.length}
                </span>
              )}
            </h2>
          </div>

          {pending.length === 0 ? (
            <div className="py-16 text-center">
              <CheckCircle size={40} className="text-emerald-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">All caught up!</p>
              <p className="text-slate-400 text-sm mt-1">No pending approvals right now</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {pending.map((p, i) => (
                <motion.div
                  key={p.reg_id}
                  initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition"
                >
                  <div className="w-9 h-9 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                    <p className="text-slate-400 text-xs truncate">{p.course_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => approve(p.reg_id)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button onClick={() => reject(p.reg_id)}
                      className="flex items-center gap-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold px-3 py-2 rounded-xl transition"
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}