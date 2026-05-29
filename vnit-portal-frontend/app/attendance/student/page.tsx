"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { CalendarCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { sessionQuery } from "@/lib/session";

type CourseAttendance = {
  course_code: string;
  course_name: string;
  present: number;
  total: number;
  percentage: number;
};

function AttendanceCard({ c, i }: { c: CourseAttendance; i: number }) {
  const pct   = c.percentage;
  const good  = pct >= 75;
  const warn  = pct >= 60 && pct < 75;
  const color = good ? "text-emerald-600" : warn ? "text-amber-600" : "text-red-600";
  const bar   = good ? "bg-emerald-500" : warn ? "bg-amber-400"    : "bg-red-500";
  const bg    = good ? "bg-emerald-50 border-emerald-100" : warn ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100";

  const classesNeeded  = Math.max(0, Math.ceil((0.75 * c.total - c.present) / 0.25));
  const classesCanSkip = good ? Math.floor((c.present - 0.75 * c.total) / 0.75) : 0;

  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.06 }}
      className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all ${bg}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            {c.course_code}
          </span>
          <p className="font-bold text-slate-800 mt-1.5 text-sm leading-snug">{c.course_name}</p>
        </div>
        <div className={`text-2xl font-black ${color} flex-shrink-0`}>{pct}%</div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, delay: i * 0.06 + 0.2, ease: "easeOut" }}
          className={`h-2 rounded-full ${bar}`}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">{c.present} / {c.total} classes attended</span>
        {!good && classesNeeded > 0 && (
          <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
            <AlertTriangle size={11} /> Attend {classesNeeded} more
          </span>
        )}
        {good && classesCanSkip > 0 && (
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <CheckCircle size={11} /> Can skip {classesCanSkip}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function StudentAttendance() {
  const [data,    setData]    = useState<CourseAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const sq    = sessionQuery();   // ← passes session_id + semester

        const res  = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/attendance/student${sq}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        setData(Array.isArray(json) ? json : []);
      } catch { toast.error("Failed to load attendance"); }
      finally  { setLoading(false); }
    })();
  }, []);

  const avg          = data.length
    ? Math.round(data.reduce((s, c) => s + c.percentage, 0) / data.length)
    : 0;
  const belowCutoff  = data.filter(c => c.percentage < 75).length;
  const sessionLabel = localStorage.getItem("short_session") || "Current Session";

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className={`rounded-3xl p-7 text-white shadow-xl ${avg >= 75
          ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/20"
          : "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20"}`}
      >
        <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{sessionLabel}</p>
        <h1 className="text-2xl font-black mb-4">My Attendance</h1>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-black">{avg}%</p>
            <p className="text-white/70 text-xs">Average</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-black">{data.length}</p>
            <p className="text-white/70 text-xs">Courses</p>
          </div>
          <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
            <p className="text-2xl font-black">{belowCutoff}</p>
            <p className="text-white/70 text-xs">Below 75%</p>
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap">
        {[
          { color: "bg-emerald-500", label: "≥75% — Good Standing" },
          { color: "bg-amber-400",   label: "60–74% — Warning" },
          { color: "bg-red-500",     label: "<60% — Critical" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2 text-xs text-slate-500">
            <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>

      {data.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <CalendarCheck size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-semibold">No attendance data for this session</p>
          <p className="text-slate-400 text-sm mt-1">Session: {sessionLabel}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((c, i) => <AttendanceCard key={i} c={c} i={i} />)}
        </div>
      )}
    </div>
  );
}