"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  BookOpen, CalendarCheck, Wallet, UserCircle,
  ClipboardList, Users, TrendingUp, CheckCircle,
  Clock, ChevronRight, GraduationCap, MapPin,
} from "lucide-react";

/* ─── tiny helpers ──────────────────────────────────────────── */
const card = (i = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.4, delay: i * 0.07 },
});

function StatCard({
  label, value, sub, icon: Icon, gradient, i = 0,
}: { label: string; value: string | number; sub?: string; icon: any; gradient: string; i?: number }) {
  return (
    <motion.div {...card(i)}
      className={`rounded-2xl p-5 text-white relative overflow-hidden shadow-lg ${gradient}`}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
      <div className="absolute -right-2 -bottom-6 w-28 h-28 bg-white/5 rounded-full" />
      <div className="relative">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3">
          <Icon size={20} />
        </div>
        <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
        <p className="text-3xl font-black">{value}</p>
        {sub && <p className="text-white/70 text-xs mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

function QuickAction({
  label, desc, href, icon: Icon, color, i = 0,
}: { label: string; desc: string; href: string; icon: any; color: string; i?: number }) {
  const router = useRouter();
  return (
    <motion.div {...card(i)} whileHover={{ y: -3 }}
      onClick={() => router.push(href)}
      className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="font-bold text-slate-800 text-sm">{label}</p>
      <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
      <div className="flex items-center gap-1 mt-3 text-blue-600 text-xs font-semibold">
        Open <ChevronRight size={12} />
      </div>
    </motion.div>
  );
}

/* ─── Main component ─────────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const [role,      setRole]      = useState<string | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [student,   setStudent]   = useState<any>(null);
  const [attendance,setAttendance]= useState<any[]>([]);
  const [stats,     setStats]     = useState({ total: 0, approved: 0, pending: 0 });

  useEffect(() => {
    const token    = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    if (!token) { router.push("/"); return; }
    setRole(userRole);

    async function load() {
      try {
        if (userRole === "admin") {
          const d = await apiFetch("/admin/stats");
          setStats(d);
        }
        if (userRole === "student") {
          const [prof, att] = await Promise.all([
            apiFetch("/students/me"),
            apiFetch("/attendance/student").catch(() => []),
          ]);
          setStudent(prof);
          setAttendance(att || []);
          // Cache name for navbar
          if (prof?.first_name)
            localStorage.setItem("user_name", `${prof.first_name} ${prof.last_name || ""}`.trim());
        }
        if (userRole === "faculty") {
          const courses = await apiFetch("/attendance/my-courses").catch(() => []);
          setStudent({ courses });
        }
      } catch (e: any) {
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm">Loading your dashboard...</p>
      </div>
    </div>
  );

  /* ── STUDENT VIEW ── */
  if (role === "student" && student) {
    const avgAttendance = attendance.length
      ? Math.round(attendance.reduce((a: number, c: any) => a + c.percentage, 0) / attendance.length)
      : null;

    return (
      <div className="space-y-6 pb-8">
        {/* Hero Banner */}
        <motion.div {...card(0)}
          className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-7 text-white relative overflow-hidden shadow-xl shadow-blue-500/20"
        >
          <div className="absolute right-0 top-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute right-24 bottom-0 w-40 h-40 bg-indigo-400/10 rounded-full translate-y-1/2" />
          <div className="relative flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider mb-1">
                Welcome back 👋
              </p>
              <h2 className="text-3xl font-black mb-1">
                {student.first_name} {student.last_name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <GraduationCap size={12} /> {student.roll_number}
                </span>
                <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <BookOpen size={12} /> M.Tech CSE
                </span>
                {student.city && (
                  <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                    <MapPin size={12} /> {student.city}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-200 text-xs">Academic Year</p>
              <p className="font-bold text-lg">2025 – 26</p>
              <p className="text-blue-200 text-xs mt-1">Semester I</p>
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard i={1} label="Courses"   value={attendance.length || "—"} sub="Registered this sem"
            icon={BookOpen} gradient="bg-gradient-to-br from-blue-500 to-blue-700" />
          <StatCard i={2} label="Attendance" value={avgAttendance !== null ? `${avgAttendance}%` : "—"}
            sub={avgAttendance !== null ? (avgAttendance >= 75 ? "Good standing" : "Needs attention") : "No data yet"}
            icon={CalendarCheck} gradient={`bg-gradient-to-br ${avgAttendance !== null && avgAttendance < 75 ? "from-rose-500 to-red-600" : "from-emerald-500 to-teal-600"}`} />
          <StatCard i={3} label="Category"  value={student.category || "—"} sub="Reservation category"
            icon={UserCircle} gradient="bg-gradient-to-br from-violet-500 to-purple-700" />
          <StatCard i={4} label="Advisor"   value="Ashish Tiwari" sub="Faculty Advisor"
            icon={Users} gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="font-black text-slate-800 mb-4 text-lg">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <QuickAction i={5} label="My Profile"    desc="View your details"      href="/students"            icon={UserCircle}    color="bg-blue-100 text-blue-600" />
            <QuickAction i={6} label="Courses"       desc="Register for courses"   href="/course-registration" icon={BookOpen}      color="bg-indigo-100 text-indigo-600" />
            <QuickAction i={7} label="Attendance"    desc="Track your attendance"  href="/attendance/student"  icon={CalendarCheck} color="bg-emerald-100 text-emerald-600" />
            <QuickAction i={8} label="Fee Management"desc="View & pay fees"        href="/fees"                icon={Wallet}        color="bg-amber-100 text-amber-600" />
          </div>
        </div>

        {/* Attendance Summary */}
        {attendance.length > 0 && (
          <motion.div {...card(9)}>
            <h3 className="font-black text-slate-800 mb-4 text-lg">Attendance Summary</h3>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {attendance.map((c: any, idx: number) => {
                const pct = c.percentage;
                const color = pct >= 75 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-400" : "bg-red-500";
                const textColor = pct >= 75 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-red-600";
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{c.course_name}</p>
                      <p className="text-slate-400 text-xs">{c.course_code} · {c.present}/{c.total} classes</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-slate-100 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className={`h-1.5 rounded-full ${color}`}
                        />
                      </div>
                      <span className={`text-sm font-bold w-10 text-right ${textColor}`}>{pct}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  /* ── ADMIN VIEW ── */
  if (role === "admin") {
    return (
      <div className="space-y-6 pb-8">
        <motion.div {...card(0)} className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-7 text-white">
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Admin Console</p>
          <h2 className="text-3xl font-black">System Overview</h2>
          <p className="text-slate-400 mt-1 text-sm">Manage students, faculty and approvals</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard i={1} label="Total Students" value={stats.total}    sub="All enrolled" icon={Users}        gradient="bg-gradient-to-br from-blue-500 to-indigo-700" />
          <StatCard i={2} label="Approved"        value={stats.approved} sub="Registrations" icon={CheckCircle} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
          <StatCard i={3} label="Pending"          value={stats.pending}  sub="Awaiting action" icon={Clock}     gradient="bg-gradient-to-br from-amber-500 to-orange-600" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <QuickAction i={4} label="Admin Panel" desc="Manage students & faculty"  href="/admin"    icon={ShieldCheck}   color="bg-slate-100 text-slate-700" />
          <QuickAction i={5} label="All Students" desc="View all student records" href="/students" icon={Users}         color="bg-blue-100 text-blue-600" />
        </div>
      </div>
    );
  }

  /* ── FACULTY VIEW ── */
  if (role === "faculty") {
    const courses = student?.courses || [];
    return (
      <div className="space-y-6 pb-8">
        <motion.div {...card(0)} className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-3xl p-7 text-white">
          <p className="text-indigo-200 text-sm font-semibold uppercase tracking-wider mb-1">Faculty Portal</p>
          <h2 className="text-3xl font-black">Welcome, Professor</h2>
          <p className="text-indigo-200 mt-1 text-sm">Manage your courses and student approvals</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <QuickAction i={1} label="Pending Approvals" desc="Review registrations"  href="/admin"     icon={ClipboardList} color="bg-amber-100 text-amber-600" />
          <QuickAction i={2} label="Mark Attendance"   desc="Record daily attendance" href="/attendance" icon={CalendarCheck} color="bg-emerald-100 text-emerald-600" />
        </div>

        {courses.length > 0 && (
          <motion.div {...card(3)}>
            <h3 className="font-black text-slate-800 mb-4">Your Courses</h3>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
              {courses.map((c: any, i: number) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0">
                  <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{c.course_name}</p>
                    <p className="text-slate-400 text-xs">{c.course_code}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return null;
}