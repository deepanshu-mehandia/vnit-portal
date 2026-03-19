"use client";
import ThemeToggle from "./themeToggle"
import { logout } from "@/lib/auth"

<button
  onClick={logout}
  className="text-sm bg-red-500 text-white px-3 py-1 rounded"
>
  Logout
</button>

export default function Navbar() {
  return (
    <div className="bg-white dark:bg-gray-900 shadow px-6 py-4 flex justify-between items-center">

      <h1 className="text-lg font-semibold">
        VNIT Portal
      </h1>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <span className="text-sm text-gray-600 dark:text-gray-300">
          Admin
        </span>
      </div>

    </div>
  )
}
