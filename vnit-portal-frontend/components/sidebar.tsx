"use client";
import Image from "next/image"

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

        <a href="/dashboard" className="hover:text-gray-300">Dashboard</a>
        <a href="/registration" className="hover:text-gray-300">Registration</a>
        <a href="/fees" className="hover:text-gray-300">Fees</a>
        <a href="/students" className="hover:text-gray-300">Students</a>
        <a href="/admin" className="hover:text-gray-300">Admin</a>

      </nav>

    </div>
  )
}
