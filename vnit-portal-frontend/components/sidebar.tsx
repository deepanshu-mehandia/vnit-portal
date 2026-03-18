import Link from "next/link"

const menu = [
  {name:"Dashboard",path:"/dashboard"},
  {name:"Registration",path:"/registration"},
  {name:"Fees",path:"/fees"},
  {name:"Hostel",path:"/hostel"},
  {name:"Student Profile",path:"/students"}
]

export default function Sidebar() {
  return (
    <div className="w-64 bg-gray-900 text-white p-6 hidden md:block">

      <h2 className="text-xl font-bold mb-6">
        VNIT
      </h2>

      <nav className="space-y-3 text-sm">

        <a href="/dashboard" className="block hover:text-gray-300">
          Dashboard
        </a>

        <a href="/students" className="block hover:text-gray-300">
          Students
        </a>

        <a href="/registration" className="block hover:text-gray-300">
          Registration
        </a>

        <a href="/fees" className="block hover:text-gray-300">
          Fees
        </a>

        <a href="/admin" className="block hover:text-gray-300">
          Admin
        </a>

      </nav>

    </div>
  )
}
