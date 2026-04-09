"use client";
import Image from "next/image"
import Link from "next/link";

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white p-6 hidden md:flex flex-col">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Image src="/assets/logo.png" alt="VNIT" width={40} height={40} />
        <span className="font-bold text-lg">VNIT Portal</span>
      </div>

      {/* Menu */}
      <nav className="space-y-4 text-sm">

        <Link href="/dashboard" className="block hover:text-blue-400">Dashboard</Link>
        <Link href="/registration" className="block hover:text-blue-400">Registration</Link>
        <Link href="/fees" className="block hover:text-blue-400">Fees</Link>
        <Link href="/students" className="block hover:text-blue-400">Students</Link>
        <Link href="/admin" className="block hover:text-blue-400">Admin</Link>
        <Link href="/admission" className="block hover:text-blue-400">Admission</Link>

      </nav>

    </div>
  )
}
