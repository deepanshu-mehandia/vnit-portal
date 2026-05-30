"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Plus, Lock, Unlock, BookOpen, Users,
  Trash2, X, Save, ChevronDown, Search, Edit2,
  CheckCircle, AlertCircle, LayoutGrid,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────
type Session  = { id: number; year: string; session: string; registration_open: boolean; offering_count: number };
type Course   = { course_id: number; course_code: string; course_name: string; credits: number; course_type: string; semester: number };
type Faculty  = { faculty_id: number; name: string; designation: string; department?: string };
type Offering = { offering_id: number; course_id: number; course_code: string; course_name: string; credits: number; course_type: string; faculty_id: number; faculty_name: string; capacity: number; enrolled: number };

// ─── Session label helper ────────────────────────────────────────
function semLabel(code: string) {
  if (code.startsWith("W")) return "Odd Semester (Jul–Nov)";
  if (code.startsWith("S")) return "Even Semester (Jan–May)";
  return code;
}

// ─── New Session Modal ───────────────────────────────────────────
function NewSessionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const currentYear = new Date().getFullYear();
  const [semType, setSemType] = useState<"W" | "S">("W");
  const [yearA,   setYearA]   = useState(String(currentYear));
  const [loading, setLoading] = useState(false);

  const yearB   = semType === "W" ? String(Number(yearA) + 1) : yearA;
  const yearStr = semType === "W" ? `${yearA}-${yearB}` : `${Number(yearA) - 1}-${yearA}`;
  const code    = `${semType}${yearA.slice(-2)}`;

  async function create() {
    try {
      setLoading(true);
      await apiFetch("/admin/sessions", {
        method: "POST",
        body: JSON.stringify({ year: yearStr, session: code }),
      });
      toast.success(`Session ${code} (${yearStr}) created!`);
      onCreated();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-7 py-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center">
            <X size={16} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black">New Academic Session</h2>
              <p className="text-blue-200 text-sm">Create a semester for course offerings</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Semester type */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Semester Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([["W", "Odd Semester", "Jul – Nov"], ["S", "Even Semester", "Jan – May"]] as const).map(([val, label, months]) => (
                <button key={val} onClick={() => setSemType(val as "W" | "S")}
                  className={`p-3 rounded-xl border-2 text-left transition ${
                    semType === val
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className={`font-bold text-sm ${semType === val ? "text-blue-700" : "text-slate-700"}`}>{label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{months}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Year input */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              {semType === "W" ? "Starting Year" : "Ending Year"}
            </label>
            <input
              type="number" value={yearA} onChange={e => setYearA(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 2025"
            />
          </div>

          {/* Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 font-semibold">Session Code</p>
              <p className="text-2xl font-black text-slate-800">{code}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-semibold">Academic Year</p>
              <p className="text-lg font-bold text-slate-700">{yearStr}</p>
            </div>
          </div>

          <button onClick={create} disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Plus size={16} /> {loading ? "Creating..." : "Create Session"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Add Offering Modal ──────────────────────────────────────────
function AddOfferingModal({ sessionId, courses, faculty, onClose, onAdded }: {
  sessionId: number;
  courses: Course[];
  faculty: Faculty[];
  onClose: () => void;
  onAdded: () => void;
}) {
  const [courseSearch,     setCourseSearch]     = useState("");
  const [selectedCourse,   setSelectedCourse]   = useState<Course | null>(null);
  const [selectedFaculty,  setSelectedFaculty]  = useState("");
  const [capacity,         setCapacity]         = useState("60");
  const [loading,          setLoading]          = useState(false);
  const [showCourseList,   setShowCourseList]   = useState(false);

  const filteredCourses = courses.filter(c =>
    !courseSearch ||
    c.course_code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.course_name.toLowerCase().includes(courseSearch.toLowerCase())
  );

  async function addOffering() {
    if (!selectedCourse) { toast.error("Select a course"); return; }
    if (!selectedFaculty) { toast.error("Select a faculty member"); return; }
    try {
      setLoading(true);
      await apiFetch("/admin/offerings", {
        method: "POST",
        body: JSON.stringify({
          course_id:  selectedCourse.course_id,
          faculty_id: Number(selectedFaculty),
          session_id: sessionId,
          capacity:   Number(capacity),
        }),
      });
      toast.success(`${selectedCourse.course_code} added!`);
      onAdded();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-7 py-6 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center">
            <X size={16} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black">Add Course Offering</h2>
              <p className="text-emerald-100 text-sm">Assign a course + faculty for this session</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Course picker */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Course</label>
            <div className="relative">
              <div
                onClick={() => setShowCourseList(!showCourseList)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm cursor-pointer flex items-center justify-between hover:border-slate-300 transition"
              >
                {selectedCourse ? (
                  <div>
                    <span className="font-bold text-slate-800">{selectedCourse.course_code}</span>
                    <span className="text-slate-500 ml-2">{selectedCourse.course_name}</span>
                  </div>
                ) : (
                  <span className="text-slate-400">Search and select a course…</span>
                )}
                <ChevronDown size={14} className="text-slate-400 flex-shrink-0" />
              </div>

              {showCourseList && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-2 border-b border-slate-100">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input autoFocus value={courseSearch} onChange={e => setCourseSearch(e.target.value)}
                        placeholder="Search by code or name…"
                        className="w-full pl-8 pr-3 py-2 text-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="max-h-52 overflow-y-auto">
                    {filteredCourses.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-4">No courses found</p>
                    ) : filteredCourses.map(c => (
                      <div key={c.course_id}
                        onClick={() => { setSelectedCourse(c); setShowCourseList(false); setCourseSearch(""); }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer"
                      >
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-20 text-center flex-shrink-0">
                          {c.course_code}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{c.course_name}</p>
                          <p className="text-xs text-slate-400">{c.credits} cr · {c.course_type} · Sem {c.semester}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Faculty picker */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Faculty</label>
            <select value={selectedFaculty} onChange={e => setSelectedFaculty(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select a faculty member…</option>
              {faculty.map(f => (
                <option key={f.faculty_id} value={f.faculty_id}>
                  {f.name} {f.designation ? `— ${f.designation}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Capacity */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">
              Seat Capacity
            </label>
            <input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button onClick={addOffering} disabled={loading || !selectedCourse || !selectedFaculty}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Plus size={16} /> {loading ? "Adding…" : "Add Offering"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Change Faculty Modal ────────────────────────────────────────
function ChangeFacultyModal({ offering, faculty, onClose, onSaved }: {
  offering: Offering; faculty: Faculty[]; onClose: () => void; onSaved: () => void;
}) {
  const [selected, setSelected] = useState(String(offering.faculty_id));
  const [capacity, setCapacity] = useState(String(offering.capacity));
  const [loading,  setLoading]  = useState(false);

  async function save() {
    try {
      setLoading(true);
      await Promise.all([
        apiFetch(`/admin/offerings/${offering.offering_id}/faculty`, {
          method: "PUT",
          body: JSON.stringify({ faculty_id: Number(selected) }),
        }),
        apiFetch(`/admin/offerings/${offering.offering_id}/capacity`, {
          method: "PUT",
          body: JSON.stringify({ capacity: Number(capacity) }),
        }),
      ]);
      toast.success("Updated!");
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-7 py-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center">
            <X size={16} />
          </button>
          <p className="text-slate-400 text-xs uppercase tracking-widest mb-0.5">Edit Offering</p>
          <h2 className="text-base font-black">{offering.course_code} – {offering.course_name}</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Faculty</label>
            <select value={selected} onChange={e => setSelected(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {faculty.map(f => (
                <option key={f.faculty_id} value={f.faculty_id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block mb-2">Capacity</label>
            <input type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Save size={16} /> {loading ? "Saving…" : "Save Changes"}
            </button>
            <button onClick={onClose} className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition">
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function SessionManagementPage() {
  const router = useRouter();
  const [sessions,       setSessions]       = useState<Session[]>([]);
  const [courses,        setCourses]        = useState<Course[]>([]);
  const [faculty,        setFaculty]        = useState<Faculty[]>([]);
  const [offerings,      setOfferings]      = useState<Offering[]>([]);
  const [selectedSessId, setSelectedSessId] = useState<number | null>(null);
  const [loading,        setLoading]        = useState(true);
  const [loadOff,        setLoadOff]        = useState(false);
  const [toggling,       setToggling]       = useState<number | null>(null);
  const [showNewSess,    setShowNewSess]    = useState(false);
  const [showAddOff,     setShowAddOff]     = useState(false);
  const [editingOff,     setEditingOff]     = useState<Offering | null>(null);

  useEffect(() => {
    if (localStorage.getItem("role") !== "admin") { router.push("/dashboard"); return; }
    loadBootstrap();
  }, []);

  async function loadBootstrap() {
    try {
      const [sess, crs, fac] = await Promise.all([
        apiFetch("/admin/sessions"),
        apiFetch("/admin/courses/list"),
        apiFetch("/admin/faculty/all"),
      ]);
      setSessions(sess);
      setCourses(crs);
      // Flatten faculty from the all-faculty endpoint
      const flatFac = (fac as any[]).map((f: any) => ({
        faculty_id:  f.faculty_id,
        name:        f.name,
        designation: f.designation,
        department:  f.department,
      }));
      setFaculty(flatFac);
      // Auto-select latest session
      if (sess.length > 0) selectSession(sess[0].id);
    } catch (e: any) {
      toast.error(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function selectSession(id: number) {
    setSelectedSessId(id);
    setLoadOff(true);
    try {
      const data = await apiFetch(`/admin/sessions/${id}/offerings`);
      setOfferings(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load offerings");
    } finally {
      setLoadOff(false);
    }
  }

  async function toggleRegistration(sessId: number) {
    setToggling(sessId);
    try {
      const res = await apiFetch(`/admin/sessions/${sessId}/registration`, { method: "PATCH" });
      setSessions(prev => prev.map(s =>
        s.id === sessId ? { ...s, registration_open: res.registration_open } : s
      ));
      toast.success(res.registration_open ? "Registration opened" : "Registration closed");
    } catch (e: any) {
      toast.error(e.message || "Failed");
    } finally {
      setToggling(null);
    }
  }

  async function deleteOffering(offering_id: number, course_code: string) {
    if (!confirm(`Delete ${course_code} from this session?`)) return;
    try {
      await apiFetch(`/admin/offerings/${offering_id}`, { method: "DELETE" });
      toast.success(`${course_code} removed`);
      setOfferings(prev => prev.filter(o => o.offering_id !== offering_id));
      setSessions(prev => prev.map(s =>
        s.id === selectedSessId ? { ...s, offering_count: s.offering_count - 1 } : s
      ));
    } catch (e: any) {
      toast.error(e.message || "Cannot delete");
    }
  }

  const selectedSession = sessions.find(s => s.id === selectedSessId);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {showNewSess && (
          <NewSessionModal
            onClose={() => setShowNewSess(false)}
            onCreated={() => { setShowNewSess(false); loadBootstrap(); }}
          />
        )}
        {showAddOff && selectedSessId && (
          <AddOfferingModal
            sessionId={selectedSessId}
            courses={courses}
            faculty={faculty}
            onClose={() => setShowAddOff(false)}
            onAdded={() => {
              setShowAddOff(false);
              selectSession(selectedSessId);
              setSessions(prev => prev.map(s =>
                s.id === selectedSessId ? { ...s, offering_count: s.offering_count + 1 } : s
              ));
            }}
          />
        )}
        {editingOff && (
          <ChangeFacultyModal
            offering={editingOff}
            faculty={faculty}
            onClose={() => setEditingOff(null)}
            onSaved={() => { setEditingOff(null); if (selectedSessId) selectSession(selectedSessId); }}
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-7 text-white shadow-xl"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LayoutGrid size={18} className="text-slate-400" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Administrator</p>
              </div>
              <h1 className="text-2xl font-black">Course & Session Management</h1>
              <p className="text-slate-400 text-sm mt-1">
                {sessions.length} sessions · {courses.length} courses in database
              </p>
            </div>
            <button onClick={() => setShowNewSess(true)}
              className="flex items-center gap-2 bg-white text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition text-sm shadow-sm"
            >
              <Plus size={16} /> New Session
            </button>
          </div>
        </motion.div>

        {/* ── Sessions Grid ── */}
        <div>
          <h2 className="text-sm font-black text-slate-600 uppercase tracking-wider mb-3">
            Academic Sessions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s, i) => (
              <motion.div key={s.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => selectSession(s.id)}
                className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                  selectedSessId === s.id
                    ? "border-blue-500 shadow-md shadow-blue-100"
                    : "border-slate-100 hover:border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        s.session.startsWith("W")
                          ? "bg-orange-100 text-orange-700"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {s.session}
                      </span>
                      {selectedSessId === s.id && (
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                          Selected
                        </span>
                      )}
                    </div>
                    <p className="font-black text-slate-800">{s.year}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{semLabel(s.session)}</p>
                  </div>

                  {/* Registration toggle */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleRegistration(s.id); }}
                    disabled={toggling === s.id}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition ${
                      s.registration_open
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {toggling === s.id ? (
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : s.registration_open ? (
                      <><Unlock size={11} /> Open</>
                    ) : (
                      <><Lock size={11} /> Closed</>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <BookOpen size={12} />
                  <span>{s.offering_count} course{s.offering_count !== 1 ? "s" : ""} offered</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Course Offerings ── */}
        {selectedSession && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* Offerings header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-black text-slate-800 flex items-center gap-2">
                  <BookOpen size={18} />
                  {selectedSession.session} — {selectedSession.year}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-1 ${
                    selectedSession.registration_open
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}>
                    {selectedSession.registration_open ? "Registration Open" : "Registration Closed"}
                  </span>
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  {offerings.length} course{offerings.length !== 1 ? "s" : ""} offered this session
                </p>
              </div>
              <button onClick={() => setShowAddOff(true)}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl transition text-sm"
              >
                <Plus size={15} /> Add Course
              </button>
            </div>

            {/* Offerings table */}
            {loadOff ? (
              <div className="flex justify-center py-12">
                <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : offerings.length === 0 ? (
              <div className="py-16 text-center">
                <BookOpen size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">No courses offered yet</p>
                <p className="text-slate-400 text-sm mt-1">Click "Add Course" to assign courses to this session</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {/* Table header */}
                <div className="grid grid-cols-12 px-6 py-2 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <div className="col-span-1">Code</div>
                  <div className="col-span-4">Course Name</div>
                  <div className="col-span-1 text-center">Cr</div>
                  <div className="col-span-1 text-center">Type</div>
                  <div className="col-span-3">Faculty</div>
                  <div className="col-span-1 text-center">Seats</div>
                  <div className="col-span-1 text-center">Actions</div>
                </div>

                {offerings.map((o, i) => (
                  <motion.div key={o.offering_id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-12 px-6 py-3 items-center hover:bg-slate-50/60 transition group"
                  >
                    <div className="col-span-1">
                      <span className="font-mono text-xs font-bold text-blue-600">{o.course_code}</span>
                    </div>
                    <div className="col-span-4 pr-4">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{o.course_name}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-xs font-bold text-slate-600">{o.credits}</span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-xs font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        {o.course_type}
                      </span>
                    </div>
                    <div className="col-span-3 pr-4">
                      <p className="text-xs font-semibold text-slate-700 truncate">{o.faculty_name}</p>
                    </div>
                    <div className="col-span-1 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-xs font-bold ${o.enrolled >= o.capacity ? "text-red-600" : "text-slate-600"}`}>
                          {o.enrolled}/{o.capacity}
                        </span>
                        {o.enrolled >= o.capacity && (
                          <span className="text-[10px] text-red-500 font-semibold">Full</span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-1 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => setEditingOff(o)}
                        className="w-7 h-7 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center transition"
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => deleteOffering(o.offering_id, o.course_code)}
                        className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg flex items-center justify-center transition"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Summary footer */}
            {offerings.length > 0 && (
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex gap-6 text-xs text-slate-500">
                <span>Total credits: <b className="text-slate-700">{offerings.reduce((s, o) => s + (o.credits || 0), 0)}</b></span>
                <span>DC: <b className="text-slate-700">{offerings.filter(o => o.course_type === "DC").length}</b></span>
                <span>DE: <b className="text-slate-700">{offerings.filter(o => o.course_type === "DE").length}</b></span>
                <span>AU: <b className="text-slate-700">{offerings.filter(o => o.course_type === "AU").length}</b></span>
                <span>Total enrolled: <b className="text-slate-700">{offerings.reduce((s, o) => s + o.enrolled, 0)}</b></span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
}