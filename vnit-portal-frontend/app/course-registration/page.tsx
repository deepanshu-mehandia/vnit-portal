"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { BookOpen, Users, Star, CheckCircle, Loader } from "lucide-react";

type Course = {
  offering_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  capacity: number;
  faculty: string;
  registered?: boolean;
};

export default function CourseRegistration() {
  const [courses,   setCourses]   = useState<Course[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [filter,    setFilter]    = useState<"all" | "registered" | "available">("all");
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/available`)
      .then(r => r.json())
      .then(d => { setCourses(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function handleRegister(offering_id: number) {
    try {
      setLoadingId(offering_id);
      const token      = localStorage.getItem("token");
      const student_id = localStorage.getItem("student_id");
      if (!token || !student_id) { toast.error("Please login again"); return; }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/registrations`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ student_id: Number(student_id), offering_id }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.detail || "Registration failed"); return; }
      toast.success("Registered successfully!");
      setCourses(prev => prev.map(c => c.offering_id === offering_id ? { ...c, registered: true } : c));
    } catch { toast.error("Something went wrong"); }
    finally { setLoadingId(null); }
  }

  const shown = courses.filter(c =>
    filter === "all" ? true : filter === "registered" ? c.registered : !c.registered
  );

  const registeredCount = courses.filter(c => c.registered).length;
  const totalCredits    = courses.filter(c => c.registered).reduce((s, c) => s + c.credits, 0);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-7 text-white shadow-xl shadow-indigo-500/20"
      >
        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Semester I · 2025–26</p>
        <h1 className="text-2xl font-black mb-4">Course Registration</h1>
        <div className="flex flex-wrap gap-4">
          {[
            { label: "Registered",   value: registeredCount },
            { label: "Total Credits", value: totalCredits },
            { label: "Available",    value: courses.length - registeredCount },
          ].map(s => (
            <div key={s.label} className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <p className="text-xl font-black">{s.value}</p>
              <p className="text-indigo-200 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all","available","registered"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              filter === f
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid gap-4">
        {shown.map((course, i) => (
          <motion.div
            key={course.offering_id}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-5 hover:shadow-md transition-all ${
              course.registered ? "border-emerald-200 bg-emerald-50/30" : "border-slate-100"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
              course.registered ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
            }`}>
              <BookOpen size={20} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {course.course_code}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Star size={10} /> {course.credits} Credits
                </span>
              </div>
              <p className="font-bold text-slate-800 mt-1 text-sm">{course.course_name}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Users size={11} /> {course.faculty}
                </span>
                <span className="text-xs text-slate-400">Capacity: {course.capacity}</span>
              </div>
            </div>

            {course.registered ? (
              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-100 px-3 py-1.5 rounded-xl">
                <CheckCircle size={15} /> Registered
              </div>
            ) : (
              <button onClick={() => handleRegister(course.offering_id)}
                disabled={loadingId === course.offering_id}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition disabled:opacity-60 flex items-center gap-2 whitespace-nowrap"
              >
                {loadingId === course.offering_id
                  ? <><Loader size={14} className="animate-spin" /> Registering...</>
                  : "Register"}
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}