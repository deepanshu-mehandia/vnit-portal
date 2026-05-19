"use client";

import ThemeToggle from "./themeToggle";
import { logout } from "@/lib/auth";

export default function Navbar() {
  return (
    <div className="bg-white dark:bg-gray-900 shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">VNIT Portal</h1>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button
          onClick={logout}
          className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}