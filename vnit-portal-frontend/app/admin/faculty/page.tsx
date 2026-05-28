"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, BookOpen, Search, ShieldCheck, Mail, Award, Filter, 
  Edit2, X, Save, Building2, GraduationCap 
} from "lucide-react";

/* ── Edit Faculty Modal ─────────────────────────────────── */
function EditFacultyModal({ faculty, branches, onClose, onSave }: {
  faculty: any; branches: any[]; onClose: () => void; onSave: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: faculty.name || "",
    email: faculty.email || "",
    designation: faculty.designation || "",
    qualification: faculty.qualification || "",
    research_area: faculty.research_area || "",
    branch_id: faculty.branch_id || "",
    is_advisor: faculty.is_advisor || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div initial={{ opacity:0, scale:0.9, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.95, y:10 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-7 py-6 text-white relative">
          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
          <h2 className="text-xl font-black">Edit Faculty Member</h2>
          <p className="text-slate-400 text-sm mt-1">Update faculty information</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input type="text" required value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Email
              </label>
              <input type="email" required value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Designation
              </label>
              <input type="text" value={formData.designation}
                onChange={e => setFormData({...formData, designation: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Qualification
              </label>
              <input type="text" value={formData.qualification}
                onChange={e => setFormData({...formData, qualification: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Department
              </label>
              <select value={formData.branch_id}
                onChange={e => setFormData({...formData, branch_id: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Select Department</option>
                {branches.map(b => (
                  <option key={b.branch_id} value={b.branch_id}>{b.branch_name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Research Area
              </label>
              <textarea value={formData.research_area} rows={2}
                onChange={e => setFormData({...formData, research_area: e.target.value})}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={formData.is_advisor}
                  onChange={e => setFormData({...formData, is_advisor: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-700">Faculty Advisor</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save Changes
            </button>
            <button type="button" onClick={onClose}
              className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AdminFacultyPage() {
  const router = useRouter();
  const [facultyByDept, setFacultyByDept] = useState<Record<string, any[]>>({});
  const [branches, setBranches] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editingFaculty, setEditingFaculty] = useState<any>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") { router.push("/dashboard"); return; }

    Promise.all([
      apiFetch("/admin/faculty/by-department"),
      apiFetch("/admin/branches/all"),
    ])
      .then(([faculty, branchList]) => {
        setFacultyByDept(faculty);
        setBranches(branchList);
      })
      .catch((e: any) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveFaculty = async (data: any) => {
    if (!editingFaculty) return;
    
    try {
      await apiFetch(`/admin/faculty/${editingFaculty.faculty_id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      toast.success("Faculty updated successfully");
      setEditingFaculty(null);
      
      // Refresh data
      const faculty = await apiFetch("/admin/faculty/by-department");
      setFacultyByDept(faculty);
    } catch (e: any) {
      toast.error(e.message || "Failed to update faculty");
    }
  };

  // Flatten and filter faculty
  const allFaculty = Object.entries(facultyByDept).flatMap(([dept, members]) =>
    members.map(m => ({ ...m, department: dept }))
  );

  const filtered = allFaculty.filter(f => {
    const matchesSearch = !search ||
      f.name?.toLowerCase().includes(search.toLowerCase()) ||
      f.designation?.toLowerCase().includes(search.toLowerCase()) ||
      f.research_area?.toLowerCase().includes(search.toLowerCase());
    
    const matchesDept = !deptFilter || f.department === deptFilter;
    
    return matchesSearch && matchesDept;
  });

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalFaculty = allFaculty.length;
  const totalAdvisors = allFaculty.filter(f => f.is_advisor).length;
  const totalDepts = Object.keys(facultyByDept).length;

  return (
    <>
      <AnimatePresence>
        {editingFaculty && (
          <EditFacultyModal
            faculty={editingFaculty}
            branches={branches}
            onClose={() => setEditingFaculty(null)}
            onSave={handleSaveFaculty}
          />
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto space-y-5 pb-10">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
          className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-3xl p-7 text-white shadow-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Administrator</p>
          </div>
          <h1 className="text-2xl font-black">Faculty Management</h1>
          <p className="text-slate-400 text-sm mt-3">
            Manage faculty members across all departments
          </p>
          
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { label: "Total Faculty", value: totalFaculty, icon: Users },
              { label: "Advisors", value: totalAdvisors, icon: ShieldCheck },
              { label: "Departments", value: totalDepts, icon: Building2 },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon size={14} className="text-white/60" />
                  <p className="text-white/60 text-xs">{s.label}</p>
                </div>
                <p className="text-2xl font-black">{s.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name, designation, or research area…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          
          <div className="relative sm:w-64">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none"
            >
              <option value="">All Departments</option>
              {Object.keys(facultyByDept).sort().map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Faculty Cards */}
        <div className="space-y-3">
          {filtered.map((f, i) => (
            <motion.div key={f.faculty_id}
              initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
            >
              {/* Faculty row */}
              <div className="flex items-center gap-4 px-6 py-4">
                <div
                  className="flex items-center gap-4 flex-1 min-w-0 cursor-pointer"
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
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <p className="text-slate-500 text-xs">{f.designation}</p>
                      {f.department && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Building2 size={10} /> {f.department}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`text-slate-400 transition-transform duration-200 ${expanded === f.faculty_id ? "rotate-90" : ""}`}>›</div>
                </div>

                <button onClick={() => setEditingFaculty(f)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
                >
                  <Edit2 size={12} /> Edit
                </button>
              </div>

              {/* Expanded details */}
              <motion.div
                initial={false}
                animate={{ height: expanded === f.faculty_id ? "auto" : 0, opacity: expanded === f.faculty_id ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 border-t border-slate-50 pt-4 space-y-3">
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
                        <GraduationCap size={12} className="text-slate-400" />
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Qualification</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{f.qualification || "—"}</p>
                    </div>
                  </div>

                  {f.research_area && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Award size={12} className="text-slate-400" />
                        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Research Area</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-800">{f.research_area}</p>
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
    </>
  );
}