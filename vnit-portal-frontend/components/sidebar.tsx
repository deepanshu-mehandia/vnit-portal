"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, CalendarCheck, Wallet,
  UserCircle, ShieldCheck, Users, GraduationCap, LogOut,
  ChevronRight, ClipboardList,
} from "lucide-react";

const studentLinks = [
  { href: "/dashboard",           label: "Dashboard",    icon: LayoutDashboard },
  { href: "/students",            label: "My Profile",   icon: UserCircle },
  { href: "/course-registration", label: "Courses",      icon: BookOpen },
  { href: "/attendance/student",  label: "Attendance",   icon: CalendarCheck },
  { href: "/fees",                label: "Fees",         icon: Wallet },
];

const facultyLinks = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin",     label: "Approvals",  icon: ClipboardList },
  { href: "/attendance",label: "Attendance", icon: CalendarCheck },
];

const adminLinks = [
  { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin",     label: "Admin Panel",icon: ShieldCheck },
  { href: "/students",  label: "Students",   icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [role,  setRole]  = useState<string | null>(null);
  const [name,  setName]  = useState("User");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token    = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");
    const userName = localStorage.getItem("user_name") || "";
    if (!token) { router.replace("/"); return; }
    setRole(userRole);
    setName(userName || (userRole === "admin" ? "Administrator" : userRole === "faculty" ? "Faculty" : "Student"));
    setReady(true);
  }, [router]);

  if (!ready || !role) return null;

  const links = role === "student" ? studentLinks : role === "faculty" ? facultyLinks : adminLinks;
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  function handleLogout() {
    localStorage.clear();
    router.replace("/");
  }

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0,   opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex"
    >
      {/* ── Brand ── */}
      <div className="px-6 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap size={18} className="text-white" />
          </div>
          <div>
            <p className="font-black text-sm tracking-wide">VNIT Portal</p>
            <p className="text-slate-400 text-[10px] uppercase tracking-widest">AIMS System</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>

        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 3 }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} className={active ? "text-white" : "text-slate-500 group-hover:text-slate-300"} />
                  <span className="text-sm font-semibold">{label}</span>
                </div>
                {active && <ChevronRight size={14} className="text-blue-200" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* ── User card ── */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-800/60 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{name}</p>
            <p className="text-[10px] text-slate-400 capitalize">{role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 group"
        >
          <LogOut size={16} />
          <span className="text-sm font-semibold">Sign Out</span>
        </button>
      </div>
    </motion.div>
  );
}