"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setRole(userRole);
  }, []);

  function linkClass(path: string) {
    return `block px-3 py-2 rounded-lg transition ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;
  }

  return (
    <div className="w-64 bg-gray-900 text-white p-6 hidden md:flex flex-col justify-between">

      {/* TOP */}
      <div>

        {/* LOGO */}
        <div className="flex items-center gap-3 mb-10">
          <Image src="/assets/logo.png" alt="VNIT" width={40} height={40} />
          <span className="font-bold text-lg">VNIT Portal</span>
        </div>

        {/* MENU */}
        <nav className="space-y-2 text-sm">

          <Link href="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>

          {/* STUDENT */}
          {role === "student" && (
            <>
              <Link href="/admission" className={linkClass("/admission")}>
                Admission
              </Link>

              <Link href="/registration" className={linkClass("/registration")}>
                Registration
              </Link>

              <Link href="/fees" className={linkClass("/fees")}>
                Fees
              </Link>

              <Link href="/students" className={linkClass("/students")}>
                My Profile
              </Link>
            </>
          )}

          {/* FACULTY */}
          {role === "faculty" && (
            <>
              <Link href="/admin" className={linkClass("/admin")}>
                Approvals
              </Link>
            </>
          )}

          {/* ADMIN */}
          {role === "admin" && (
            <>
              <Link href="/admin" className={linkClass("/admin")}>
                Admin Panel
              </Link>

              <Link href="/students" className={linkClass("/students")}>
                Students
              </Link>
            </>
          )}

        </nav>
      </div>

      {/* BOTTOM */}
      <div className="pt-6 border-t border-gray-800">

        <p className="text-xs text-gray-400 mb-2">
          Logged in as:
        </p>
        <p className="text-sm font-semibold capitalize mb-4">
          {role || "Loading..."}
        </p>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            router.push("/login");
          }}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
        >
          Logout
        </button>

      </div>
    </div>
  );
}