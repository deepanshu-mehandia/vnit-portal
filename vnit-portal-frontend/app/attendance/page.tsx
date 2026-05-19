"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { CalendarCheck, Users, CheckCircle, Save, RefreshCw } from "lucide-react";

type Student = { student_id: number; name: string; roll_number: string };

export default function AttendancePage() {
  const today = new Date().toISOString().split("T")[0];

  const [courses,        setCourses]        = useState<any[]>([]);
  const [students,       setStudents]       = useState<Student[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedDate,   setSelectedDate]   = useState(today);
  const [attendance,     setAttendance]     = useState<Record<number, string>>({});
  const [loading,        setLoading]        = useState(false);
  const [loadingStudents,setLoadingStudents]= useState(false);
  const [saved,          setSaved]          = useState(false);

  // Load faculty courses on mount
  useEffect(() => {
    apiFetch("/attendance/my-courses")
      .then(setCourses)
      .catch((e: any) => toast.error(e.message));
  }, []);

  // Reload students + existing marks when course or date changes
  useEffect(() => {
    if (!selectedCourse) return;
    loadStudentsAndMarks(selectedCourse, selectedDate);
  }, [selectedCourse, selectedDate]);

  async function loadStudentsAndMarks(offering_id: number, date: string) {
    try {
      setLoadingStudents(true);
      setSaved(false);

      const [studentsData, existingMarks] = await Promise.all([
        apiFetch(`/attendance/course/${offering_id}`),
        apiFetch(`/attendance/course/${offering_id}/marks/${date}`).catch(() => ({})),
      ]);

      setStudents(studentsData);

      // Pre-fill: use existing marks if available, else default to "present"
      const initial: Record<number, string> = {};
      studentsData.forEach((s: Student) => {
        initial[s.student_id] = (existingMarks as any)[s.student_id] ?? "present";
      });
      setAttendance(initial);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingStudents(false);
    }
  }

  async function submitAttendance() {
    try {
      setLoading(true);
      const records = Object.entries(attendance).map(([id, status]) => ({
        student_id: Number(id),
        status,
      }));
      await apiFetch("/attendance/mark", {
        method: "POST",
        body: JSON.stringify({ offering_id: selectedCourse, date: selectedDate, records }),
      });
      setSaved(true);
      toast.success("Attendance saved!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  const presentCount = Object.values(attendance).filter(v => v === "present").length;
  const absentCount  = Object.values(attendance).filter(v => v === "absent").length;

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-7 text-white shadow-xl shadow-indigo-500/20"
      >
        <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Faculty Portal</p>
        <h1 className="text-2xl font-black mb-1">Mark Attendance</h1>
        <p className="text-indigo-200 text-sm">Select a course and date to record attendance</p>
      </motion.div>

      {/* Controls */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 grid sm:grid-cols-2 gap-4"
      >
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
            Course
          </label>
          <select
            onChange={e => setSelectedCourse(Number(e.target.value))}
            className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
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
            Date
          </label>
          <input type="date" value={selectedDate} max={today}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50 text-slate-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>
      </motion.div>

      {/* Student list */}
      <AnimatePresence mode="wait">
        {loadingStudents ? (
          <motion.div key="spinner" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="flex justify-center py-12"
          >
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </motion.div>

        ) : students.length > 0 ? (
          <motion.div key="list" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" /> {presentCount} Present
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-red-500">
                  <div className="w-2 h-2 bg-red-400 rounded-full" /> {absentCount} Absent
                </span>
                <span className="text-slate-400">{students.length} Total</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  const all: Record<number,string> = {};
                  students.forEach(s => { all[s.student_id] = "present"; });
                  setAttendance(all);
                }} className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition">
                  All Present
                </button>
                <button onClick={() => {
                  const all: Record<number,string> = {};
                  students.forEach(s => { all[s.student_id] = "absent"; });
                  setAttendance(all);
                }} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition">
                  All Absent
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {students.map((s, i) => {
                const isPresent = attendance[s.student_id] === "present";
                return (
                  <motion.div key={s.student_id}
                    initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setAttendance(a => ({
                      ...a, [s.student_id]: isPresent ? "absent" : "present"
                    }))}
                    className={`flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 cursor-pointer transition-all select-none ${
                      isPresent ? "hover:bg-emerald-50/50" : "bg-red-50/40 hover:bg-red-50"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      isPresent ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                    }`}>
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
                      <p className="text-slate-400 text-xs">{s.roll_number}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isPresent
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {isPresent ? "✓ Present" : "✗ Absent"}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Submit */}
            <div className="flex gap-3 mt-4">
              <motion.button whileTap={{ scale:0.97 }} onClick={submitAttendance} disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all disabled:opacity-60 ${
                  saved
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/20"
                }`}
              >
                {loading ? (
                  <><RefreshCw size={16} className="animate-spin" /> Saving...</>
                ) : saved ? (
                  <><CheckCircle size={16} /> Saved!</>
                ) : (
                  <><Save size={16} /> Save Attendance</>
                )}
              </motion.button>
            </div>
            <p className="text-center text-slate-400 text-xs mt-2">
              Click on a student row to toggle present / absent
            </p>
          </motion.div>

        ) : selectedCourse ? (
          <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="bg-white rounded-2xl border border-slate-100 p-12 text-center"
          >
            <Users size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No students enrolled</p>
            <p className="text-slate-400 text-sm mt-1">No students are registered for this course yet</p>
          </motion.div>
        ) : (
          <motion.div key="placeholder" initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center"
          >
            <CalendarCheck size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Select a course to begin</p>
            <p className="text-slate-400 text-sm mt-1">Choose a course and date from above</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}