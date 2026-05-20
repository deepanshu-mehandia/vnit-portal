"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { Award, Save, RefreshCw, Users, CheckCircle } from "lucide-react";

const EXAM_TYPES = ["UT1", "UT2", "Assignment", "Lab", "End Sem"];
const EXAM_MAX: Record<string, number> = {
  "UT1": 30, "UT2": 30, "Assignment": 20, "Lab": 50, "End Sem": 60,
};

type Student = { student_id: number; name: string; roll_number: string; marks: Record<string, number> };

export default function MarksEntryPage() {
  const [courses,      setCourses]      = useState<any[]>([]);
  const [selectedCourse, setSelected]  = useState<number | null>(null);
  const [examType,     setExamType]     = useState("UT1");
  const [students,     setStudents]     = useState<Student[]>([]);
  const [marksInput,   setMarksInput]   = useState<Record<number, string>>({});
  const [loading,      setLoading]      = useState(false);
  const [loadingData,  setLoadingData]  = useState(false);
  const [saved,        setSaved]        = useState(false);

  useEffect(() => {
    apiFetch("/attendance/my-courses")
      .then(setCourses)
      .catch((e: any) => toast.error(e.message));
  }, []);

  async function loadCourseData(offering_id: number) {
    try {
      setLoadingData(true);
      setSaved(false);
      const data: Student[] = await apiFetch(`/marks/course/${offering_id}`);
      setStudents(data);

      // Pre-fill existing marks for the selected exam type
      const pre: Record<number, string> = {};
      data.forEach(s => {
        pre[s.student_id] = s.marks[examType] !== undefined ? String(s.marks[examType]) : "";
      });
      setMarksInput(pre);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingData(false);
    }
  }

  // Reload marks when exam type changes
  useEffect(() => {
    if (!selectedCourse || students.length === 0) return;
    const pre: Record<number, string> = {};
    students.forEach(s => {
      pre[s.student_id] = s.marks[examType] !== undefined ? String(s.marks[examType]) : "";
    });
    setMarksInput(pre);
  }, [examType]);

  async function handleCourseChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = Number(e.target.value);
    setSelected(id);
    setStudents([]);
    if (id) await loadCourseData(id);
  }

  async function submitMarks() {
    const max = EXAM_MAX[examType] || 100;
    const entries = students.map(s => {
      const m = Number(marksInput[s.student_id] ?? "");
      if (marksInput[s.student_id] === "" || isNaN(m)) return null;
      if (m < 0 || m > max) {
        toast.error(`Marks for ${s.name} must be between 0 and ${max}`);
        return undefined;
      }
      return { student_id: s.student_id, marks: m };
    });

    if (entries.includes(undefined)) return;
    const valid = entries.filter(Boolean) as any[];

    if (valid.length === 0) { toast.error("No marks entered"); return; }

    try {
      setLoading(true);
      await apiFetch("/marks/enter", {
        method: "POST",
        body: JSON.stringify({ offering_id: selectedCourse, exam_type: examType, entries: valid }),
      });
      setSaved(true);
      toast.success("Marks saved!");
      // Refresh
      if (selectedCourse) await loadCourseData(selectedCourse);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  const max = EXAM_MAX[examType] || 100;

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-3xl p-7 text-white shadow-xl shadow-violet-500/20"
      >
        <p className="text-violet-200 text-xs font-bold uppercase tracking-widest mb-1">Faculty Portal</p>
        <h1 className="text-2xl font-black mb-1">Enter Marks</h1>
        <p className="text-violet-200 text-sm">Select a course and exam type to enter student marks</p>
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 grid sm:grid-cols-2 gap-4"
      >
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Course</label>
          <select onChange={handleCourseChange}
            className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
          >
            <option value="">— Select Course —</option>
            {courses.map(c => (
              <option key={c.offering_id} value={c.offering_id}>
                {c.course_code} – {c.course_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Exam Type <span className="text-slate-400 normal-case font-normal">(max: {max})</span>
          </label>
          <select value={examType} onChange={e => setExamType(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition"
          >
            {EXAM_TYPES.map(t => (
              <option key={t} value={t}>{t} (out of {EXAM_MAX[t]})</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Students */}
      <AnimatePresence mode="wait">
        {loadingData ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : students.length > 0 ? (
          <motion.div key="list" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-slate-600 flex items-center gap-2">
                <Users size={15} /> {students.length} students · Enter marks out of {max}
              </p>
              <button onClick={() => {
                const all: Record<number, string> = {};
                students.forEach(s => { all[s.student_id] = ""; });
                setMarksInput(all);
              }} className="text-xs font-bold text-slate-400 hover:text-slate-600 transition">
                Clear all
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {students.map((s, i) => {
                const existing = s.marks[examType];
                const input    = marksInput[s.student_id] ?? "";
                const numVal   = Number(input);
                const valid    = input === "" || (!isNaN(numVal) && numVal >= 0 && numVal <= max);

                return (
                  <motion.div key={s.student_id}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0"
                  >
                    <div className="w-9 h-9 bg-violet-100 text-violet-700 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                      <p className="text-slate-400 text-xs">{s.roll_number}</p>
                    </div>
                    {existing !== undefined && (
                      <span className="text-xs font-bold text-slate-400 hidden sm:block">
                        Saved: {existing}/{max}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={max}
                        value={input}
                        onChange={e => {
                          setSaved(false);
                          setMarksInput(m => ({ ...m, [s.student_id]: e.target.value }));
                        }}
                        placeholder={existing !== undefined ? String(existing) : "—"}
                        className={`w-20 text-center border rounded-xl px-2 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 transition ${
                          valid
                            ? "border-slate-200 bg-slate-50 focus:ring-violet-500 focus:bg-white"
                            : "border-red-300 bg-red-50 focus:ring-red-400"
                        }`}
                      />
                      <span className="text-xs text-slate-400 font-medium">/{max}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4">
              <motion.button whileTap={{ scale:0.97 }} onClick={submitMarks} disabled={loading}
                className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 ${
                  saved
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg shadow-violet-500/20"
                }`}
              >
                {loading ? <><RefreshCw size={16} className="animate-spin" /> Saving...</>
                  : saved  ? <><CheckCircle size={16} /> Saved!</>
                  : <><Save size={16} /> Save Marks</>}
              </motion.button>
            </div>
          </motion.div>
        ) : selectedCourse ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Users size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No students enrolled in this course</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
            <Award size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Select a course to begin</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}