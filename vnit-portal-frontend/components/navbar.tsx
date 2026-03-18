import ThemeToggle from "./themeToggle"

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
