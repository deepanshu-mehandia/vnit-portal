"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { motion } from "framer-motion";
import { Printer, Award, TrendingUp, BookOpen } from "lucide-react";

/* ── helpers ────────────────────────────────── */
function sessionLabel(code: string): string {
  if (!code) return "Session";
  const yr = 2000 + parseInt(code.slice(1));
  if (code.startsWith("W")) return `AUTUMN (July–Nov) ${yr}`;
  if (code.startsWith("S")) return `SPRING (Jan–May) ${yr}`;
  return code;
}

const GP_COLOR: Record<string, string> = {
  O:  "text-emerald-700",
  AB: "text-emerald-600",
  BB: "text-blue-600",
  BC: "text-sky-600",
  CC: "text-amber-600",
  CD: "text-orange-500",
  DD: "text-red-500",
  FF: "text-red-700",
  SS: "text-slate-400",
};

const GP_BG: Record<string, string> = {
  O:  "bg-emerald-50 border-emerald-200",
  AB: "bg-emerald-50 border-emerald-200",
  BB: "bg-blue-50 border-blue-200",
  BC: "bg-sky-50 border-sky-200",
  CC: "bg-amber-50 border-amber-200",
  CD: "bg-orange-50 border-orange-200",
  DD: "bg-red-50 border-red-200",
  FF: "bg-red-100 border-red-300",
  SS: "bg-slate-50 border-slate-200",
};

/* ── semester card ──────────────────────────── */
function SemesterCard({ sem, idx }: { sem: any; idx: number }) {
  const label = sessionLabel(sem.session_code);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden print:shadow-none print:rounded-none print:border print:border-slate-300 print:mb-6"
    >
      {/* Semester header */}
      <div className="bg-slate-800 text-white px-6 py-3 flex items-center justify-between print:bg-slate-900">
        <p className="font-black text-sm tracking-widest uppercase">{label}</p>
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <span>{sem.year}</span>
        </div>
      </div>

      {/* Courses table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
              <th className="text-left px-4 py-2.5 font-semibold w-28">Code</th>
              <th className="text-left px-4 py-2.5 font-semibold">Course Title</th>
              <th className="text-center px-4 py-2.5 font-semibold w-14">Cr</th>
              <th className="text-center px-4 py-2.5 font-semibold w-14">Type</th>
              <th className="text-center px-4 py-2.5 font-semibold w-16">Grade</th>
              <th className="text-center px-4 py-2.5 font-semibold w-14">GP</th>
              <th className="text-center px-4 py-2.5 font-semibold w-16">EGP</th>
            </tr>
          </thead>
          <tbody>
            {sem.courses.map((c: any, ci: number) => {
              const egp = c.grade_points != null ? c.grade_points * c.credits : null;
              return (
                <tr key={ci} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold text-slate-600">{c.course_code}</td>
                  <td className="px-4 py-2.5 text-slate-800 font-medium">
                    {c.course_name}
                    {c.course_type && (
                      <span className="ml-2 text-xs text-slate-400 font-normal">({c.course_type})</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center text-slate-600 font-semibold">{c.credits || "—"}</td>
                  <td className="px-4 py-2.5 text-center">
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                      {c.course_type || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {c.grade ? (
                      <span className={`font-black text-sm ${GP_COLOR[c.grade] || "text-slate-400"}`}>
                        {c.grade}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center text-slate-600 font-semibold text-sm">
                    {c.grade_points ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-center text-slate-600 font-semibold text-sm">
                    {egp != null ? egp : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SGPA / CGPA row */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3">
        <div className="flex items-center gap-3 bg-blue-600 text-white rounded-xl px-5 py-3">
          <div>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-widest">SGPA</p>
            <p className="text-3xl font-black leading-none">{sem.sgpa.toFixed(2)}</p>
          </div>
          <div className="border-l border-blue-400 pl-3 text-blue-100 text-xs space-y-0.5">
            <p>Credits: <span className="font-bold text-white">{sem.sem_credits}</span></p>
            <p>EGP: <span className="font-bold text-white">{sem.sem_egp}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-emerald-600 text-white rounded-xl px-5 py-3">
          <div>
            <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest">CGPA</p>
            <p className="text-3xl font-black leading-none">{sem.cgpa.toFixed(2)}</p>
          </div>
          <div className="border-l border-emerald-400 pl-3 text-emerald-100 text-xs space-y-0.5">
            <p>Credits: <span className="font-bold text-white">{sem.cum_credits}</span></p>
            <p>EGP: <span className="font-bold text-white">{sem.cum_egp}</span></p>
          </div>
        </div>

        {/* Course type breakdown */}
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 self-center">
          {["DC", "DE", "AU", "OC"].map(type => {
            const count = sem.courses.filter((c: any) => c.course_type === type).length;
            const credits = sem.courses.filter((c: any) => c.course_type === type).reduce((s: number, c: any) => s + (c.credits || 0), 0);
            return count > 0 ? (
              <span key={type} className="bg-slate-100 px-2 py-1 rounded font-semibold">
                {type}: {credits}cr
              </span>
            ) : null;
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ── main page ─────────────────────────────── */
export default function GradeCardPage() {
  const router = useRouter();
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [today,   setToday]   = useState("");

  useEffect(() => {
    if (!isAuthenticated()) { router.push("/"); return; }
    setToday(new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }));
    apiFetch("/marks/grade-card")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data || !data.sessions?.length) return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
        <Award size={48} className="text-slate-200 mx-auto mb-4" />
        <p className="text-slate-600 font-bold text-lg">No grade data yet</p>
        <p className="text-slate-400 text-sm mt-1">
          Grades appear once marks are entered for your approved courses
        </p>
      </div>
    </div>
  );

  const cgpa = data.sessions[data.sessions.length - 1]?.cgpa ?? 0;
  const cgpaColor = cgpa >= 8 ? "text-emerald-600" : cgpa >= 6.5 ? "text-blue-600" : "text-amber-600";

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-5">

      {/* ── Top bar (screen only) ── */}
      <div className="no-print flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">Grade Card</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Grades calculated from entered marks · {data.student.roll_number}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Overall CGPA badge */}
          <div className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-sm">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Overall CGPA</p>
            <p className={`text-3xl font-black ${cgpaColor}`}>{cgpa.toFixed(2)}</p>
            <p className="text-xs text-slate-400">{data.total_credits} credits</p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-5 py-3.5 rounded-xl transition shadow-sm"
          >
            <Printer size={16} /> Print / PDF
          </button>
        </div>
      </div>

      {/* ── Printable grade card ── */}
      <div id="grade-card-print">

        {/* Official header (visible in both screen and print) */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-5 print:rounded-none print:border-0 print:mb-4">
          <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200">
            {/* Left logo placeholder */}
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white font-black text-2xl flex-shrink-0">
              V
            </div>

            {/* Center text */}
            <div className="text-center">
              <p className="font-black text-blue-900 text-lg tracking-wide leading-tight">
                VISVESVARAYA NATIONAL INSTITUTE OF TECHNOLOGY
              </p>
              <p className="font-bold text-blue-800 text-base">NAGPUR</p>
              <div className="mt-3 border-y-2 border-slate-800 py-1.5 px-8">
                <p className="font-black text-slate-800 text-base tracking-[0.15em] uppercase">
                  Provisional Grade Card
                </p>
              </div>
            </div>

            {/* Right CGPA circle */}
            <div className="w-16 h-16 rounded-full border-4 border-blue-900 flex flex-col items-center justify-center flex-shrink-0">
              <p className="text-xs font-bold text-blue-900 leading-none">CGPA</p>
              <p className={`text-lg font-black leading-none ${cgpaColor}`}>{cgpa.toFixed(2)}</p>
            </div>
          </div>

          {/* Student info */}
          <div className="grid grid-cols-2 gap-0 divide-x divide-slate-200">
            <div className="px-8 py-4 space-y-2">
              {[
                { label: "Name",   value: data.student.name },
                { label: "Branch", value: data.student.branch },
              ].map(r => (
                <div key={r.label} className="flex items-baseline gap-2 text-sm">
                  <span className="text-slate-500 font-semibold w-20 flex-shrink-0">{r.label}</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-bold text-slate-800">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="px-8 py-4 space-y-2">
              {[
                { label: "Enrollment No.", value: data.student.roll_number },
                { label: "Degree",         value: data.student.program },
              ].map(r => (
                <div key={r.label} className="flex items-baseline gap-2 text-sm">
                  <span className="text-slate-500 font-semibold w-32 flex-shrink-0">{r.label}</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-bold text-slate-800">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Semester cards */}
        {data.sessions.map((sem: any, i: number) => (
          <SemesterCard key={i} sem={sem} idx={i} />
        ))}

        {/* Footer */}
        <div className="bg-white border border-slate-200 rounded-2xl px-8 py-5 print:rounded-none print:border-t print:border-slate-300 print:border-x-0 print:border-b-0">
          <div className="flex items-start justify-between gap-8">
            <div className="text-xs text-slate-500 space-y-1 flex-1">
              <p className="font-bold text-slate-700 mb-1">Note:</p>
              <p>Abbreviations: Cr – Credits, Gr – Grade, GP – Grade Points, EGP – Earned Grade Points (GP × Cr)</p>
              <p>SGPA – Semester Grade Point Average &nbsp;|&nbsp; CGPA – Cumulative Grade Point Average</p>
              <p>DC – Discipline Core &nbsp;|&nbsp; DE – Discipline Elective &nbsp;|&nbsp; AU – Audit &nbsp;|&nbsp; OC – Open Course</p>
              <p className="text-slate-400 italic mt-2">
                (This statement is provisional and based on marks entered in the AIMS portal)
              </p>
            </div>
            <div className="text-right text-sm flex-shrink-0">
              <p className="text-slate-500 text-xs">Date of Result:</p>
              <p className="font-bold text-slate-800">{today}</p>
              <p className="text-slate-500 text-xs">Medium of Instruction:</p>
              <p className="font-bold text-slate-800">English</p>
              <p className="mt-4 font-bold text-slate-700">Dy.Reg.(Academic)</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grade scale legend (screen only) ── */}
      <div className="no-print bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <TrendingUp size={14} /> Grade Scale (10-point system)
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { g: "O",  r: "≥ 90%", p: 10 },
            { g: "AB", r: "80–89%", p: 9  },
            { g: "BB", r: "70–79%", p: 8  },
            { g: "BC", r: "60–69%", p: 7  },
            { g: "CC", r: "50–59%", p: 6  },
            { g: "CD", r: "45–49%", p: 5  },
            { g: "DD", r: "40–44%", p: 4  },
            { g: "FF", r: "< 40%",  p: 0  },
            { g: "SS", r: "Audit",  p: "–" as any },
          ].map(({ g, r, p }) => (
            <div key={g} className={`border rounded-xl px-3 py-2 text-center ${GP_BG[g] || "bg-slate-50"}`}>
              <p className={`font-black text-base ${GP_COLOR[g] || "text-slate-500"}`}>{g}</p>
              <p className="text-xs text-slate-500">{r}</p>
              <p className="text-xs font-bold text-slate-600">{p} pts</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}