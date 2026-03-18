import Link from "next/link"

const menu = [
  {name:"Dashboard",path:"/dashboard"},
  {name:"Registration",path:"/registration"},
  {name:"Fees",path:"/fees"},
  {name:"Hostel",path:"/hostel"},
  {name:"Student Profile",path:"/students"}
]

export default function Sidebar(){
  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4 space-y-4">

      <h2 className="text-xl font-bold">VNIT</h2>

      <div className="space-y-2">
        <p>Dashboard</p>
        <p>Students</p>
        <p>Courses</p>
        <p>Fees</p>
      </div>

    </div>
  )
}
