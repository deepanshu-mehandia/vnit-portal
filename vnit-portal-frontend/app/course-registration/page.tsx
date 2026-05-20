"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import {
  BookOpen, Users, Star, CheckCircle, Loader,
  Clock, XCircle, Filter,
} from "lucide-react";

type Course = {
  offering_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  capacity: number;
  faculty: string;
  registered?: boolean;
  reg_status?: string;
};

const STATUS_STYLES: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  pending:  "bg-amber-100 text-amber-700",
  rejected: "bg-red-100 text-red-700",
};

export default function CourseRegistration() {
  const [courses,   setCourses]   = useState<Course[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [tab,       setTab]       = useState<"available" | "registered">("available");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [allCourses, myRegs] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/available?semester=${localStorage.getItem("current_semester") || ""}`)
          .then(r => r.json()),
        apiFetch("/registrations/my").catch(() => []),
      ]);

      const regMap: Record<number, string> = {};
      (myRegs as any[]).forEach(r => { regMap[r.offering_id] = r.status; });

      setCourses(
        (Array.isArray(allCourses) ? allCourses : []).map((c: Course) => ({
          ...c,
          registered: c.offering_id in regMap,
          reg_status: regMap[c.offering_id],
        }))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(offering_id: number) {
    try {
      setLoadingId(offering_id);
      const student_id = localStorage.getItem("student_id");
      if (!student_id) { toast.error("Please login again"); return; }

      await apiFetch("/registrations", {
        method: "POST",
        body: JSON.stringify({ student_id: Number(student_id), offering_id }),
      });
      toast.success("Registered! Pending advisor approval.");
      setCourses(prev =>
        prev.map(c => c.offering_id === offering_id
          ? { ...c, registered: true, reg_status: "pending" }
          : c
        )
      );
      setTab("registered");
    } catch (e: any) {
      toast.error(e.message || "Registration failed");
    } finally {
      setLoadingId(null);
    }
  }

  const available   = courses.filter(c => !c.registered);
  const registered  = courses.filter(c =>  c.registered);
  const totalCredits = registered.reduce((s, c) => s + (c.credits || 0), 0);
  const shown = tab === "available" ? available : registered;

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-7 text-white shadow-xl shadow-blue-500/20"
      >
        <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Semester I · 2025–26</p>
        <h1 className="text-2xl font-black mb-4">Course Registration</h1>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Registered",    value: registered.length },
            { label: "Credits",       value: totalCredits },
            { label: "Available",     value: available.length },
            { label: "Total Courses", value: courses.length },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-blue-200 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-1.5">
        {(["available", "registered"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
              tab === t
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {t === "available" ? `Available (${available.length})` : `Registered (${registered.length})`}
          </button>
        ))}
      </div>

      {/* List */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
          className="space-y-3"
        >
          {shown.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
              <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">
                {tab === "available" ? "No more courses to register" : "No registered courses yet"}
              </p>
            </div>
          ) : shown.map((course, i) => (
            <motion.div key={course.offering_id}
              initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.04 }}
              className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-all ${
                course.reg_status === "rejected"   ? "border-red-100 bg-red-50/20"
                : course.reg_status === "approved" ? "border-emerald-100 bg-emerald-50/20"
                : course.registered                ? "border-amber-100 bg-amber-50/20"
                : "border-slate-100"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                course.reg_status === "approved" ? "bg-emerald-100 text-emerald-600"
                : course.registered             ? "bg-amber-100 text-amber-600"
                : "bg-blue-100 text-blue-600"
              }`}>
                <BookOpen size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {course.course_code}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Star size={10} /> {course.credits} Credits
                  </span>
                </div>
                <p className="font-bold text-slate-800 text-sm">{course.course_name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Users size={10} /> {course.faculty}
                  </span>
                </div>
              </div>

              {course.registered ? (
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLES[course.reg_status!] || "bg-slate-100 text-slate-600"}`}>
                    {course.reg_status === "approved" && <span className="flex items-center gap-1"><CheckCircle size={11} /> Approved</span>}
                    {course.reg_status === "pending"  && <span className="flex items-center gap-1"><Clock size={11} /> Pending</span>}
                    {course.reg_status === "rejected" && <span className="flex items-center gap-1"><XCircle size={11} /> Rejected</span>}
                  </span>
                </div>
              ) : (
                <button onClick={() => handleRegister(course.offering_id)}
                  disabled={loadingId === course.offering_id}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition disabled:opacity-60 flex items-center gap-1.5 whitespace-nowrap"
                >
                  {loadingId === course.offering_id
                    ? <><Loader size={13} className="animate-spin" /> Registering...</>
                    : "Register"}
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}