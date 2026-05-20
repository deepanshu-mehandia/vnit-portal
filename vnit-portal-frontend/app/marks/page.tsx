"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { Award, BookOpen, TrendingUp } from "lucide-react";

const EXAM_MAX: Record<string, number> = {
  "UT1": 30, "UT2": 30, "Assignment": 20, "End Sem": 60, "Lab": 50,
};

const EXAM_ORDER = ["UT1", "UT2", "Assignment", "Lab", "End Sem"];

export default function MarksPage() {
  const router = useRouter();
  const [marks,   setMarks]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/"); return; }
    apiFetch("/marks/student")
      .then(setMarks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const semLabel = localStorage.getItem("short_session") || "";

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-3xl p-7 text-white shadow-xl shadow-violet-500/20"
      >
        <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">{semLabel}</p>
        <h1 className="text-2xl font-black mb-1">My Marks</h1>
        <p className="text-violet-200 text-sm">Exam marks across all registered courses</p>
      </motion.div>

      {marks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Award size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No marks uploaded yet</p>
          <p className="text-slate-400 text-sm mt-1">Check back after your exams are evaluated</p>
        </div>
      ) : (
        <div className="space-y-4">
          {marks.map((course, i) => {
            const examTypes = EXAM_ORDER.filter(e => course.marks[e] !== undefined);
            const total     = examTypes.reduce((s, e) => s + (course.marks[e] || 0), 0);
            const maxTotal  = examTypes.reduce((s, e) => s + (EXAM_MAX[e] || 100), 0);
            const pct       = maxTotal ? Math.round((total / maxTotal) * 100) : 0;
            const color     = pct >= 60 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-600";
            const bar       = pct >= 60 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-400" : "bg-red-500";

            return (
              <motion.div key={i}
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                {/* Course header */}
                <div className="flex items-center gap-4 px-6 py-4 border-b border-slate-50">
                  <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                        {course.course_code}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{course.course_name}</p>
                    <p className="text-slate-400 text-xs">{course.faculty}</p>
                  </div>
                  {examTypes.length > 0 && (
                    <div className="text-right">
                      <p className={`text-2xl font-black ${color}`}>{pct}%</p>
                      <p className="text-xs text-slate-400">{total}/{maxTotal}</p>
                    </div>
                  )}
                </div>

                {/* Marks table */}
                {examTypes.length > 0 ? (
                  <div className="px-6 py-4">
                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: i * 0.06 + 0.2 }}
                        className={`h-1.5 rounded-full ${bar}`}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {examTypes.map(exam => {
                        const m   = course.marks[exam];
                        const max = EXAM_MAX[exam] || 100;
                        const ep  = Math.round((m / max) * 100);
                        const ec  = ep >= 60 ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                  : ep >= 40 ? "bg-amber-50 border-amber-100 text-amber-700"
                                  : "bg-red-50 border-red-100 text-red-700";
                        return (
                          <div key={exam} className={`rounded-xl border p-3 text-center ${ec}`}>
                            <p className="text-xs font-bold uppercase tracking-wide opacity-70">{exam}</p>
                            <p className="text-2xl font-black mt-1">{m}</p>
                            <p className="text-xs opacity-60">/ {max}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-3 text-slate-400 text-sm italic">No marks uploaded yet</div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}