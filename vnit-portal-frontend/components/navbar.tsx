"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu } from "lucide-react";
import { logout } from "@/lib/auth";

const pageTitles: Record<string, string> = {
  "/dashboard":           "Dashboard",
  "/students":            "My Profile",
  "/course-registration": "Course Registration",
  "/attendance/student":  "My Attendance",
  "/attendance":          "Mark Attendance",
  "/fees":                "Fee Management",
  "/admin":               "Admin Panel",
};

export default function Navbar() {
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    setName(localStorage.getItem("user_name") || "");
    setRole(localStorage.getItem("role") || "");
  }, []);

  const title = pageTitles[pathname] ?? "VNIT Portal";
  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : role?.slice(0,1).toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-1.5 text-slate-500 hover:text-slate-800">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-black text-slate-800 text-base leading-tight">{title}</h1>
          <p className="text-slate-400 text-xs hidden sm:block">
            Visvesvaraya National Institute of Technology
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          {name && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-700 leading-tight">{name}</p>
              <p className="text-xs text-slate-400 capitalize">{role}</p>
            </div>
          )}
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xs font-bold text-white cursor-pointer"
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