"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Users, BookOpen, Search, ShieldCheck, Mail, Award } from "lucide-react";

export default function AdminFacultyPage() {
  const router = useRouter();
  const [faculty,  setFaculty]  = useState<any[]>([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") { router.push("/dashboard"); return; }

    apiFetch("/admin/faculty/all")
      .then(setFaculty)
      .catch((e: any) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = faculty.filter(f =>
    !search ||
    f.name?.toLowerCase().includes(search.toLowerCase()) ||
    f.designation?.toLowerCase().includes(search.toLowerCase()) ||
    f.research_area?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-3xl p-7 text-white shadow-xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <Users size={20} />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Administrator</p>
        </div>
        <h1 className="text-2xl font-black">Faculty Directory</h1>
        <p className="text-slate-400 text-sm mt-1">
          {faculty.length} faculty members · {faculty.filter(f => f.is_advisor).length} advisors
        </p>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search by name, designation, or research area…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Faculty Cards */}
      <div className="space-y-3">
        {filtered.map((f, i) => (
          <motion.div key={f.faculty_id}
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
          >
            {/* Faculty row */}
            <div
              className="flex items-center gap-4 px-6 py-4 cursor-pointer"
              onClick={() => setExpanded(expanded === f.faculty_id ? null : f.faculty_id)}
            >
              <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                {f.name?.split(" ").map((w: string) => w[0]).join("").slice(0,2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-slate-800 text-sm">{f.name}</p>
                  {f.is_advisor && (
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck size={10} /> Advisor
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-0.5">{f.designation} · {f.qualification}</p>
              </div>

              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-600">{f.courses.length} course{f.courses.length !== 1 ? "s" : ""}</p>
                <p className="text-xs text-slate-400">assigned</p>
              </div>

              <div className={`text-slate-400 transition-transform duration-200 ${expanded === f.faculty_id ? "rotate-90" : ""}`}>›</div>
            </div>

            {/* Expanded details */}
            <motion.div
              initial={false}
              animate={{ height: expanded === f.faculty_id ? "auto" : 0, opacity: expanded === f.faculty_id ? 1 : 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-5 border-t border-slate-50 pt-4 space-y-4">
                {/* Contact & Research */}
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail size={12} className="text-slate-400" />
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Email</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{f.email}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Award size={12} className="text-slate-400" />
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Research Area</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-800">{f.research_area || "—"}</p>
                  </div>
                </div>

                {/* Courses */}
                {f.courses.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen size={12} /> Assigned Courses
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {f.courses.map((c: any) => (
                        <div key={c.offering_id}
                          className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2"
                        >
                          <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen size={13} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-blue-700">{c.course_code}</p>
                            <p className="text-xs text-slate-600 truncate">{c.course_name}</p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 ml-auto">{c.credits}cr</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <Users size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">No faculty match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}