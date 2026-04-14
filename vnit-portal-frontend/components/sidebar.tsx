"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("role");

    if (!token) {
      router.replace("/");
      return;
    }

    setRole(userRole);
    setReady(true);
  }, [router]);

  if (!ready) return null;

  function linkClass(path: string) {
    return `block px-3 py-2 rounded-lg ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800"
    }`;
  }

  return (
    <div className="w-64 bg-gray-900 text-white p-6 hidden md:flex flex-col justify-between">

      <div>
        <div className="flex items-center gap-3 mb-10">
          <Image src="/assets/logo.png" alt="VNIT" width={40} height={40} />
          <span className="font-bold text-lg">VNIT Portal</span>
        </div>

        <nav className="space-y-2 text-sm">

          <Link href="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>

          {role === "student" && (
            <>
              <Link href="/admission" className={linkClass("/admission")}>Admission</Link>
              <Link href="/registration" className={linkClass("/registration")}>Registration</Link>
              <Link href="/fees" className={linkClass("/fees")}>Fees</Link>
              <Link href="/students" className={linkClass("/students")}>My Profile</Link>
            </>
          )}

          {role === "faculty" && (
            <Link href="/admin" className={linkClass("/admin")}>
              Approvals
            </Link>
          )}

          {role === "admin" && (
            <>
              <Link href="/admin" className={linkClass("/admin")}>Admin Panel</Link>
              <Link href="/students" className={linkClass("/students")}>Students</Link>
            </>
          )}

        </nav>
      </div>

      <div className="pt-6 border-t border-gray-800">
        <p className="text-sm capitalize mb-4">{role}</p>

        <button
          onClick={() => {
            localStorage.clear();
            router.push("/");
          }}
          className="w-full bg-red-500 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}