"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, CheckCircle, XCircle, UserCheck,
  Clock, ShieldCheck, BookOpen, Search,
  X, Phone, Mail, MapPin, GraduationCap, User,
} from "lucide-react";

/* ── Student detail modal ─────────────────────────────────── */
function StudentModal({ student, onClose, onAssign }: {
  student: any; onClose: () => void; onAssign: (id: number) => void;
}) {
  const initials = [student.first_name?.[0], student.last_name?.[0]].filter(Boolean).join("").toUpperCase();
  const fullName = [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ");

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ opacity:0, scale:0.9, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95, y:10 }} transition={{ type:"spring", damping:25, stiffness:300 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-7 py-6 text-white relative">
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-xl font-black flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-0.5">Student Profile</p>
              <h2 className="text-lg font-black">{fullName}</h2>
              {student.roll_number && (
                <span className="bg-white/15 px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 inline-block">
                  {student.roll_number}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Mail,          label: "Email",         value: student.email },
              { icon: Phone,         label: "Mobile",        value: student.mobile },
              { icon: User,          label: "Gender",        value: student.gender },
              { icon: ShieldCheck,   label: "Category",      value: student.category },
              { icon: GraduationCap, label: "Program",       value: student.program_title || student.program },
              { icon: User,          label: "Advisor",       value: student.advisor_name || "Not assigned" },
              { icon: MapPin,        label: "City",          value: student.city },
              { icon: MapPin,        label: "State",         value: student.state },
            ].map(({ icon: Icon, label, value }) => value ? (
              <div key={label} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={12} className="text-slate-400" />
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
                </div>
                <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
              </div>
            ) : null)}
          </div>

          {student.address && (
            <div className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={12} className="text-slate-400" />
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Address</p>
              </div>
              <p className="text-sm font-semibold text-slate-800">{student.address}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={() => { onAssign(student.student_id); onClose(); }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-sm"
          >
            Assign / Change Advisor
          </button>
          <button onClick={onClose}
            className="px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition text-sm"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main component ───────────────────────────────────────── */
export default function AdminPage() {
  const router = useRouter();
  const [role,           setRole]           = useState<string | null>(null);
  const [students,       setStudents]       = useState<any[]>([]);
  const [pending,        setPending]        = useState<any[]>([]);
  const [search,         setSearch]         = useState("");
  const [loading,        setLoading]        = useState(true);
  const [selectedStudent,setSelectedStudent]= useState<any>(null);
  const [loadingDetail,  setLoadingDetail]  = useState(false);

  useEffect(() => {
    const token      = localStorage.getItem("token");
    const userRole   = localStorage.getItem("role");
    const isAdvisor  = localStorage.getItem("is_advisor") === "true";

    if (!token) { router.push("/"); return; }

    // Guard: faculty only enters if they're an advisor
    if (userRole === "faculty" && !isAdvisor) {
      toast.error("Only faculty advisors can access approvals");
      router.push("/dashboard");
      return;
    }
    if (userRole !== "admin" && userRole !== "faculty") {
      router.push("/dashboard");
      return;
    }

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
      } catch (e: any) {
        toast.error(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function openStudentDetail(student_id: number) {
    try {
      setLoadingDetail(true);
      const data = await apiFetch(`/admin/students/${student_id}`);
      setSelectedStudent(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load student");
    } finally {
      setLoadingDetail(false);
    }
  }

  async function assignAdvisor(student_id: number) {
    const faculty_id = prompt("Enter Faculty ID to assign as advisor:");
    if (!faculty_id || isNaN(Number(faculty_id))) return;
    try {
      await apiFetch("/admin/assign-advisor", {
        method: "POST",
        body: JSON.stringify({ student_ids: [student_id], faculty_id: Number(faculty_id) }),
      });
      toast.success("Advisor assigned successfully");
      // Refresh list
      const res = await apiFetch("/admin/students/all");
      setStudents(res);
    } catch (e: any) {
      toast.error(e.message || "Failed to assign advisor");
    }
  }

  async function approve(reg_id: number) {
    await apiFetch("/admin/faculty/approve", { method:"POST", body: JSON.stringify({ reg_id }) });
    toast.success("Registration approved");
    setPending(p => p.filter(x => x.reg_id !== reg_id));
  }

  async function reject(reg_id: number) {
    await apiFetch("/admin/faculty/reject", { method:"POST", body: JSON.stringify({ reg_id }) });
    toast.error("Registration rejected");
    setPending(p => p.filter(x => x.reg_id !== reg_id));
  }

  const filtered = students.filter(s =>
    !search ||
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {selectedStudent && (
          <StudentModal
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
            onAssign={assignAdvisor}
          />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-5 pb-10">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          className={`rounded-3xl p-7 text-white shadow-xl ${
            role === "admin"
              ? "bg-gradient-to-r from-slate-700 to-slate-900 shadow-slate-700/20"
              : "bg-gradient-to-r from-indigo-600 to-violet-700 shadow-indigo-500/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {role === "admin" ? <ShieldCheck size={20} /> : <UserCheck size={20} />}
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest">
              {role === "admin" ? "Administrator" : "Faculty Advisor"}
            </p>
          </div>
          <h1 className="text-2xl font-black">
            {role === "admin" ? "Admin Panel" : "Student Approvals"}
          </h1>
          <p className="text-white/60 text-sm mt-1">
            {role === "admin"
              ? `${students.length} students in the system — click any row to view details`
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
                <input type="text" placeholder="Search name, email, roll…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-50">
              {filtered.map((s, i) => (
                <motion.div key={s.student_id}
                  initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.03 }}
                  onClick={() => openStudentDetail(s.student_id)}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-blue-50/40 transition cursor-pointer group"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {s.name?.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition">
                      {s.name}
                    </p>
                    <div className="flex items-center gap-3">
                      <p className="text-slate-400 text-xs">{s.email}</p>
                      {s.roll_number && (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {s.roll_number}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-slate-400">{s.advisor_name || "No advisor"}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      s.category === "SC" || s.category === "ST"
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {s.category || "General"}
                    </span>
                  </div>
                  {loadingDetail ? (
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin opacity-50" />
                  ) : (
                    <div className="text-slate-300 group-hover:text-blue-400 transition">›</div>
                  )}
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-400">No students match your search</div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── FACULTY ADVISOR: Pending Approvals ── */}
        {role === "faculty" && (
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-slate-800 flex items-center gap-2">
                <Clock size={18} /> Pending Registrations
              </h2>
              {pending.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">
                  {pending.length} pending
                </span>
              )}
            </div>

            {pending.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle size={40} className="text-emerald-300 mx-auto mb-3" />
                <p className="text-slate-500 font-semibold">All caught up!</p>
                <p className="text-slate-400 text-sm mt-1">No pending approvals at the moment</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {pending.map((p, i) => (
                  <motion.div key={p.reg_id}
                    initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.04 }}
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
    </>
  );
}