"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu, Info, AlertTriangle, CheckCircle, Zap, X } from "lucide-react";
import { logout } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import ThemeToggle from "./themeToggle";
import { motion, AnimatePresence } from "framer-motion";

const pageTitles: Record<string, string> = {
  "/dashboard":           "Dashboard",
  "/students":            "My Profile",
  "/course-registration": "Course Registration",
  "/attendance/student":  "My Attendance",
  "/attendance":          "Mark Attendance",
  "/fees":                "Fee Management",
  "/admin":               "Admin Panel",
  "/admin/faculty":       "Faculty Management",
  "/admin/sessions":      "Session Management",
  "/admin/notifications": "Notifications",
  "/admin/hostel":        "Hostel Management",
  "/marks":               "My Marks",
  "/marks/entry":         "Enter Marks",
  "/grade-card":          "Grade Card",
  "/hostel":              "Hostel",
};

const TYPE_STYLES: Record<string, { icon: any; bg: string; text: string; dot: string }> = {
  info:    { icon: Info,          bg: "bg-blue-50",   text: "text-blue-600",   dot: "bg-blue-500" },
  warning: { icon: AlertTriangle, bg: "bg-amber-50",  text: "text-amber-600",  dot: "bg-amber-500" },
  urgent:  { icon: Zap,           bg: "bg-red-50",    text: "text-red-600",    dot: "bg-red-500" },
  success: { icon: CheckCircle,   bg: "bg-emerald-50",text: "text-emerald-600",dot: "bg-emerald-500" },
};

export default function Navbar() {
  const pathname = usePathname();
  const [name,        setName]        = useState("");
  const [role,        setRole]        = useState("");
  const [notifs,      setNotifs]      = useState<any[]>([]);
  const [bellOpen,    setBellOpen]    = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setName(localStorage.getItem("user_name") || "");
    setRole(localStorage.getItem("role")      || "");

    // Fetch notifications
    const token = localStorage.getItem("token");
    if (!token) return;
    apiFetch("/notifications").then(setNotifs).catch(() => {});
  }, []);

  // Close bell on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node))
        setBellOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const title    = pageTitles[pathname] ?? "VNIT Portal";
  const initials = name
    ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : role.slice(0, 1).toUpperCase();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-black text-slate-800 dark:text-slate-100 text-base leading-tight">{title}</h1>
          <p className="text-slate-400 text-xs hidden sm:block">
            Visvesvaraya National Institute of Technology
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Notification bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <Bell size={18} />
            {notifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {bellOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <p className="font-black text-slate-800 dark:text-slate-100 text-sm">Notifications</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{notifs.length} total</span>
                    <button onClick={() => setBellOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <X size={14} />
                    </button>
                  </div>
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-sm">
                      No notifications
                    </div>
                  ) : notifs.slice(0, 8).map(n => {
                    const ts = TYPE_STYLES[n.type] || TYPE_STYLES.info;
                    const Icon = ts.icon;
                    return (
                      <div key={n.id} className={`flex gap-3 px-4 py-3 border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${ts.bg}`}>
                          <Icon size={14} className={ts.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{n.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(n.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {role === "admin" && (
                  <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800">
                    <a href="/admin/notifications"
                      onClick={() => setBellOpen(false)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 dark:hover:text-blue-400"
                    >
                      Manage notifications →
                    </a>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-700">
          {name && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-tight">{name}</p>
              <p className="text-xs text-slate-400 capitalize">{role}</p>
            </div>
          )}
          <div
            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xs font-bold text-white cursor-pointer"
            onClick={logout}
            title="Click to logout"
          >
            {initials || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}